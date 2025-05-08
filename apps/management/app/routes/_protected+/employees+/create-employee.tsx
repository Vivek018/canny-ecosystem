import {
  createRole,
  EmployeeAddressesSchema,
  EmployeeBankDetailsSchema,
  EmployeeGuardiansSchema,
  EmployeeProjectAssignmentSchema,
  EmployeeSchema,
  EmployeeStatutorySchema,
  hasPermission,
  isGoodStatus,
  SIZE_1MB,
} from "@canny_ecosystem/utils";
import { createEmployee } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getInitialValueFromZod } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import {
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  redirect,
} from "@remix-run/node";
import { Card } from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import { commitSession, getSession } from "@/utils/sessions";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { FormButtons } from "@/components/form/form-buttons";
import { useIsomorphicLayoutEffect } from "@canny_ecosystem/utils/hooks/isomorphic-layout-effect";
import { CreateEmployeeDetails } from "@/components/employees/form/create-employee-details";
import { CreateEmployeeStatutoryDetails } from "@/components/employees/form/create-employee-statutory-details";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { CreateEmployeeBankDetails } from "@/components/employees/form/create-employee-bank-details";
import { CreateEmployeeAddress } from "@/components/employees/form/create-employee-address";
import type { EmployeeGuardianDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { CreateEmployeeGuardianDetails } from "@/components/employees/form/create-employee-guardian-details";
import { FormStepHeader } from "@/components/form/form-step-header";
import {
  getProjectsByCompanyId,
  getSitesByProjectId,
} from "@canny_ecosystem/supabase/queries";
import {
  CreateEmployeeProjectAssignment,
  PROJECT_PARAM,
} from "@/components/employees/form/create-employee-project-assignment";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { seedRequisitesForEmployeeCreation } from "@canny_ecosystem/supabase/seed";

export const CREATE_EMPLOYEE = [
  "create-employee",
  "create-employee-statutory-details",
  "create-employee-bank-details",
  "create-employee-project-assignment",
  "create-employee-addresses",
  "create-employee-guardians",
];

export const STEP = "step";

const SESSION_KEY_PREFIX = "multiStepEmployeeForm_step_";

const schemas = [
  EmployeeSchema,
  EmployeeStatutorySchema,
  EmployeeBankDetailsSchema,
  EmployeeProjectAssignmentSchema,
  EmployeeAddressesSchema,
  EmployeeGuardiansSchema,
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.employee}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const urlSearchParams = new URLSearchParams(url.searchParams);
  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const totalSteps = schemas.length;

  const session = await getSession(request.headers.get("Cookie"));
  const stepData: any[] = [];

  for (let i = 1; i <= totalSteps; i++) {
    stepData.push(await session.get(`${SESSION_KEY_PREFIX}${i}`));
  }

  if (step < 1 || step > totalSteps) {
    url.searchParams.set(STEP, "1");
    return redirect(url.toString(), { status: 302 });
  }

  let projectOptions: any = [];
  let projectSiteOptions: any = [];
  if (step === 4) {
    const { data: projects } = await getProjectsByCompanyId({
      supabase,
      companyId,
    });

    projectOptions = projects?.map((project) => ({
      label: project?.name,
      value: project?.id,
    }));

    const projectParamId = urlSearchParams.get(PROJECT_PARAM);

    if (projectParamId?.length) {
      const { data: projectSites } = await getSitesByProjectId({
        supabase,
        projectId: projectParamId,
      });

      projectSiteOptions = projectSites?.map((projectSite) => ({
        label: projectSite?.name,
        value: projectSite?.id,
      }));
    }
  }

  return json({
    step,
    totalSteps,
    stepData,
    companyId,
    projectOptions,
    projectSiteOptions,
  });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const url = new URL(request.url);
  const session = await getSession(request.headers.get("Cookie"));
  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const currentSchema = schemas[step - 1];
  const totalSteps = schemas.length;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({ maxPartSize: SIZE_1MB })
  );
  const actionType = formData.get("_action") as string;
  const submission = parseWithZod(formData, { schema: currentSchema });

  try {
    if (actionType === "submit") {
      if (submission.status !== "success") {
        return json(
          {
            status: "error",
            message: "Form validation failed",
            returnTo: `/create-employee?step=${step}`,
          },
          { status: 400 }
        );
      }

      const employeeData = session.get(`${SESSION_KEY_PREFIX}1`);
      const employeeStatutoryDetailsData = session.get(
        `${SESSION_KEY_PREFIX}2`
      );
      const employeeBankDetailsData = session.get(`${SESSION_KEY_PREFIX}3`);
      const employeeProjectAssignmentData = session.get(
        `${SESSION_KEY_PREFIX}4`
      );
      const employeeAddressesData = session.get(`${SESSION_KEY_PREFIX}5`);
      const employeeGuardiansData =
        submission.value as EmployeeGuardianDatabaseInsert;

      const {
        id,
        status,
        employeeError,
        employeeStatutoryDetailsError,
        employeeBankDetailsError,
        employeeProjectAssignmentError,
        employeeAddressesError,
        employeeGuardiansError,
      } = await createEmployee({
        supabase,
        employeeData,
        employeeStatutoryDetailsData,
        employeeBankDetailsData,
        employeeProjectAssignmentData,
        employeeAddressesData,
        employeeGuardiansData,
      });
      if (id) {
        await seedRequisitesForEmployeeCreation({ employeeId: id });
      }
      if (employeeError) {
        return json(
          {
            status: "error",
            message: "Failed to create employee",
            returnTo: "/employees",
          },
          { status: 500 }
        );
      }

      if (
        employeeStatutoryDetailsError ||
        employeeBankDetailsError ||
        employeeProjectAssignmentError ||
        employeeAddressesError ||
        employeeGuardiansError
      ) {
        return json(
          {
            status: "error",
            message: "Failed to save employee details",
            returnTo: DEFAULT_ROUTE,
          },
          { status: 500 }
        );
      }

      if (isGoodStatus(status)) {
        for (let i = 1; i <= totalSteps; i++) {
          session.unset(`${SESSION_KEY_PREFIX}${i}`);
        }
        return json(
          {
            status: "success",
            message: "Employee created successfully",
            returnTo: "/employees",
          },
          {
            status: status,
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          }
        );
      }
    } else if (
      actionType === "next" ||
      actionType === "back" ||
      actionType === "skip"
    ) {
      if (submission.status === "success") {
        session.set(`${SESSION_KEY_PREFIX}${step}`, submission.value);
      }

      if (submission.status === "error") {
        return json(
          {
            status: "error",
            message: "Form validation failed",
            returnTo: `/create-employee?step=${step}`,
          },
          { status: 400 }
        );
      }

      let nextStep = step;
      if (actionType === "next" || actionType === "skip") {
        nextStep = Math.min(step + 1, totalSteps);
      } else if (actionType === "back") {
        nextStep = Math.max(step - 1, 1);
      }

      url.searchParams.set(STEP, String(nextStep));
      return redirect(url.toString(), {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  } catch (error) {
    return json(
      {
        status: "error",
        message: `An unexpected error occurred${error}`,
        returnTo: "/employees",
      },
      { status: 500 }
    );
  }

  return json({});
}

export default function CreateEmployee() {
  const {
    step,
    totalSteps,
    stepData,
    companyId,
    projectOptions,
    projectSiteOptions,
  } = useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());

  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const EMPLOYEE_TAG = CREATE_EMPLOYEE[step - 1];
  const currentSchema = schemas[step - 1];
  const initialValues = getInitialValueFromZod(currentSchema);

  useIsomorphicLayoutEffect(() => {
    setResetKey(Date.now());
  }, [step]);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.employees);
        toast({
          title: "Success",
          description: actionData?.message || "Employee created successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            actionData?.message ||
            "Failed to create employee",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? "/employees");
    }
  }, [actionData]);

  const [form, fields] = useForm({
    id: EMPLOYEE_TAG,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: stepData[step - 1] ?? {
      ...initialValues,
      company_id: step === 1 ? companyId : null,
    },
  });

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <div className="w-full mx-auto mb-4">
        <FormStepHeader
          totalSteps={totalSteps}
          step={step}
          stepData={stepData}
        />
      </div>
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <div className="h-[560px] overflow-scroll">
              {step === 1 ? (
                <CreateEmployeeDetails key={resetKey} fields={fields as any} />
              ) : null}
              {step === 2 ? (
                <CreateEmployeeStatutoryDetails
                  key={resetKey + 1}
                  fields={fields as any}
                />
              ) : null}
              {step === 3 ? (
                <CreateEmployeeBankDetails
                  key={resetKey + 2}
                  fields={fields as any}
                />
              ) : null}
              {step === 4 ? (
                <CreateEmployeeProjectAssignment
                  key={resetKey + 3}
                  fields={fields as any}
                  projectOptions={projectOptions}
                  projectSiteOptions={projectSiteOptions}
                />
              ) : null}
              {step === 5 ? (
                <CreateEmployeeAddress
                  key={resetKey + 4}
                  fields={fields as any}
                />
              ) : null}
              {step === 6 ? (
                <CreateEmployeeGuardianDetails
                  key={resetKey + 5}
                  fields={fields as any}
                />
              ) : null}
            </div>
            <FormButtons
              form={form}
              setResetKey={setResetKey}
              step={step}
              totalSteps={totalSteps}
            />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}

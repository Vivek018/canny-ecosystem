import {
  EmployeeAddressesSchema,
  EmployeeBankDetailsSchema,
  EmployeeGuardiansSchema,
  EmployeeSchema,
  EmployeeStatutorySchema,
  isGoodStatus,
  SIZE_1MB,
} from "@canny_ecosystem/utils";
import { createEmployee } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getInitialValueFromZod } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import {
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  redirect,
} from "@remix-run/node";
import { Card } from "@canny_ecosystem/ui/card";
import { useState } from "react";
import { commitSession, getSession } from "@/utils/sessions";
import { DEFAULT_ROUTE } from "@/constant";
import { FormButtons } from "@/components/multi-step-form/form-buttons";
import { useIsomorphicLayoutEffect } from "@canny_ecosystem/ui/hooks/isomorphic-layout-effect";
import { CreateEmployeeStep1 } from "@/components/employees/form/create-employee-step-1";
import { CreateEmployeeStep2 } from "@/components/employees/form/create-employee-step-2";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { CreateEmployeeStep3 } from "@/components/employees/form/create-employee-step-3";
import { CreateEmployeeStep4 } from "@/components/employees/form/create-employee-step-4";
import type { EmployeeGuardianDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { CreateEmployeeStep5 } from "@/components/employees/form/create-employee-step-5";
import { FormStepHeader } from "@/components/multi-step-form/form-step-header";

export const CREATE_EMPLOYEE = [
  "create-employee",
  "create-employee-statutory-details",
  "create-employee-bank-details",
  "create-employee-addresses",
  "create-employee-guardians",
];

export const STEP = "step";

const SESSION_KEY_PREFIX = "multiStepEmployeeForm_step_";

const schemas = [
  EmployeeSchema,
  EmployeeStatutorySchema,
  EmployeeBankDetailsSchema,
  EmployeeAddressesSchema,
  EmployeeGuardiansSchema,
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const totalSteps = schemas.length;

  const session = await getSession(request.headers.get("Cookie"));
  const stepData: any[] = [];

  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  for (let i = 1; i <= totalSteps; i++) {
    stepData.push(await session.get(`${SESSION_KEY_PREFIX}${i}`));
  }

  if (step < 1 || step > totalSteps) {
    url.searchParams.set(STEP, "1");
    return redirect(url.toString(), { status: 302 });
  }

  return json({ step, totalSteps, stepData, companyId });
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const session = await getSession(request.headers.get("Cookie"));

  const step = Number.parseInt(url.searchParams.get(STEP) || "1");
  const currentSchema = schemas[step - 1];
  const totalSteps = schemas.length;

  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({ maxPartSize: SIZE_1MB }),
  );
  const action = formData.get("_action") as string;

  const submission = parseWithZod(formData, {
    schema: currentSchema,
  });

  if (action === "submit") {
    if (submission.status === "success") {
      const employeeData = session.get(`${SESSION_KEY_PREFIX}1`);
      const employeeStatutoryDetailsData = session.get(
        `${SESSION_KEY_PREFIX}2`,
      );
      const employeeBankDetailsData = session.get(`${SESSION_KEY_PREFIX}3`);
      const employeeAddressesData = session.get(`${SESSION_KEY_PREFIX}4`);
      const employeeGuardiansData = submission.value as Omit<
        EmployeeGuardianDatabaseInsert,
        "employee_id"
      >;

      const {
        status,
        employeeError,
        employeeStatutoryDetailsError,
        employeeBankDetailsError,
        employeeAddressesError,
        employeeGuardiansError,
      } = await createEmployee({
        supabase,
        employeeData,
        employeeStatutoryDetailsData,
        employeeBankDetailsData,
        employeeAddressesData,
        employeeGuardiansData,
      });

      if (employeeError) {
        for (let i = 1; i <= totalSteps; i++) {
          session.unset(`${SESSION_KEY_PREFIX}${i}`);
        }
        const headers = new Headers();
        headers.append("Set-Cookie", await commitSession(session));
        url.searchParams.delete(STEP);
        return redirect(url.toString(), { headers });
      }

      if (
        employeeStatutoryDetailsError ||
        employeeBankDetailsError ||
        employeeAddressesError ||
        employeeGuardiansError
      ) {
        for (let i = 1; i <= totalSteps; i++) {
          session.unset(`${SESSION_KEY_PREFIX}${i}`);
        }
        const headers = new Headers();
        headers.append("Set-Cookie", await commitSession(session));
        return redirect(DEFAULT_ROUTE, {
          headers,
        });
      }

      if (isGoodStatus(status)) {
        for (let i = 1; i <= totalSteps; i++) {
          session.unset(`${SESSION_KEY_PREFIX}${i}`);
        }
        const headers = new Headers();
        headers.append("Set-Cookie", await commitSession(session));
        return redirect(DEFAULT_ROUTE, {
          headers,
        });
      }
    }
  } else if (action === "next" || action === "back" || action === "skip") {
    if (action === "next") {
      if (submission.status === "success") {
        session.set(`${SESSION_KEY_PREFIX}${step}`, submission.value);
      }
      if (submission.status === "error") {
        return json(
          { result: submission.reply() },
          { status: submission.status === "error" ? 400 : 200 },
        );
      }
    }

    let nextStep = step;
    if (action === "next" || action === "skip") {
      nextStep = Math.min(step + 1, totalSteps);
    } else if (action === "back") {
      nextStep = Math.max(step - 1, 1);
    }

    url.searchParams.set(STEP, String(nextStep));
    return redirect(url.toString(), {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return json({});
}

export default function CreateEmployee() {
  const { step, totalSteps, stepData, companyId } =
    useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());

  const EMPLOYEE_TAG = CREATE_EMPLOYEE[step - 1];
  const currentSchema = schemas[step - 1];
  const initialValues = getInitialValueFromZod(currentSchema);

  useIsomorphicLayoutEffect(() => {
    setResetKey(Date.now());
  }, [step]);

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
    <section className="md:px-20 lg:px-52 2xl:px-80 py-6">
      <div className="w-full mx-auto mb-8">
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
            {step === 1 ? (
              <CreateEmployeeStep1 key={resetKey} fields={fields as any} />
            ) : null}
            {step === 2 ? (
              <CreateEmployeeStep2 key={resetKey + 1} fields={fields as any} />
            ) : null}
            {step === 3 ? (
              <CreateEmployeeStep3 key={resetKey + 2} fields={fields as any} />
            ) : null}
            {step === 4 ? (
              <CreateEmployeeStep4
                key={resetKey + 3}
                fields={fields as any}
                resetKey={resetKey * resetKey}
              />
            ) : null}
            {step === 5 ? (
              <CreateEmployeeStep5 key={resetKey + 4} fields={fields as any} />
            ) : null}
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

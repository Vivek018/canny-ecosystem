import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  EmployeeProjectAssignmentSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import {
  getEmployeeProjectAssignmentByEmployeeId,
  getSiteNamesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { updateEmployeeProjectAssignment } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useEffect, useState } from "react";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import {
  CreateEmployeeProjectAssignment,
} from "@/components/employees/form/create-employee-project-assignment";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearCacheEntry, clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_EMPLOYEE_PROJECT_ASSIGNMENT =
  "update-employee-project-assignment";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs) {
  const employeeId = params.employeeId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${updateRole}:${attribute.employeeProjectAssignment}`
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let projectAssignmentData = null;

    if (employeeId) {
      projectAssignmentData = await getEmployeeProjectAssignmentByEmployeeId({
        supabase,
        employeeId: employeeId,
      });
    }

    if (projectAssignmentData?.error) {
      return json({
        status: "error",
        message: "Failed to get employee project assignment",
        data: null,
        siteOptions: null,
        error: projectAssignmentData.error,
      });
    }

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data: sites } = await getSiteNamesByCompanyId({
      supabase,
      companyId,
    });

    const siteOptions = sites?.map((site) => ({
      label: site?.name,
      value: site?.id,
    }));

    return json({
      status: "success",
      message: "Employee project assignment found",
      data: projectAssignmentData?.data,
      siteOptions,
      error: null,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      data: null,
      siteOptions: null,
      error,
    });
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: EmployeeProjectAssignmentSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateEmployeeProjectAssignment({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee project assignment updated successfully",
        error: null,
      });
    }
    return json({
      status: "error",
      message: "Failed to update employee project assignment",
      error,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    });
  }
}

export default function UpdateEmployeeProjectAssignment() {
  const { data, siteOptions, status, error } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = EmployeeProjectAssignmentSchema;

  const [form, fields] = useForm({
    id: UPDATE_EMPLOYEE_PROJECT_ASSIGNMENT,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: data,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { employeeId } = useParams();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: (error as any)?.message || "Failed to load",
        variant: "destructive",
      });
    }
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.employees);
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`
        );
        toast({
          title: "Success",
          description: actionData?.message || "Employee updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            "Employee update failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${data?.employee_id}/work-portfolio`);
    }
  }, [actionData]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CreateEmployeeProjectAssignment
              key={resetKey}
              fields={fields as any}
              isUpdate={true}
              siteOptions={siteOptions}
            />
            <FormButtons
              form={form}
              setResetKey={setResetKey}
              isSingle={true}
            />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}

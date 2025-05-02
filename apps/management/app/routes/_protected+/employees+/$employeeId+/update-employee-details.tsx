import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getEmployeeById } from "@canny_ecosystem/supabase/queries";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { updateEmployee } from "@canny_ecosystem/supabase/mutations";
import {
  isGoodStatus,
  EmployeeSchema,
  updateRole,
  hasPermission,
} from "@canny_ecosystem/utils";
import { CreateEmployeeDetails } from "@/components/employees/form/create-employee-details";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearCacheEntry, clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_EMPLOYEE = "update-employee";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.employeeDetails}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let employeeData = null;
    let employeeError = null;

    if (employeeId) {
      ({ data: employeeData, error: employeeError } = await getEmployeeById({
        supabase,
        id: employeeId,
      }));
    } else {
      throw new Error("No employeeId provided");
    }

    if (employeeError) throw employeeError;

    return json({
      employeeData,
      employeeId,
      error: null,
    });
  } catch (error) {
    return json({
      error,
      employeeId,
      employeeData: null,
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
      schema: EmployeeSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateEmployee({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee details updated successfully",
        error: null,
      });
    }

    return json(
      { status: "error", message: "Failed to update employee", error },
      { status: 500 }
    );
  } catch (error) {
    return json({
      status: "error",
      message: "Failed to update employee",
      error,
    });
  }
}

export default function UpdateEmployeeDetails() {
  const { employeeData, employeeId, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = EmployeeSchema;

  const [form, fields] = useForm({
    id: UPDATE_EMPLOYEE,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: { ...employeeData },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.employees);
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_overview}${employeeId}`
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
      navigate(`/employees/${employeeId}/overview`);
    }
  }, [actionData]);

  if (error)
    return (
      <ErrorBoundary error={error} message="Failed to load employee details" />
    );

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
            <CreateEmployeeDetails
              key={resetKey}
              fields={fields as any}
              isUpdate={true}
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

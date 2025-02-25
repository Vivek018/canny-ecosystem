import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getEmployeeStatutoryDetailsById } from "@canny_ecosystem/supabase/queries";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { updateEmployeeStatutoryDetails } from "@canny_ecosystem/supabase/mutations";
import {
  isGoodStatus,
  EmployeeStatutorySchema,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { CreateEmployeeStatutoryDetails } from "@/components/employees/form/create-employee-statutory-details";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_EMPLOYEE_STATUTORY = "update-employee-statutory";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.employeeStatutory}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let employeeStatutoryDetailsData = null;
    let employeeStatutoryDetailsError = null;

    if (employeeId) {
      ({
        data: employeeStatutoryDetailsData,
        error: employeeStatutoryDetailsError,
      } = await getEmployeeStatutoryDetailsById({
        supabase,
        id: employeeId,
      }));
    } else {
      throw new Error("No employeeId provided");
    }

    if (employeeStatutoryDetailsError) throw employeeStatutoryDetailsError;

    return json({
      employeeStatutoryDetailsData,
      employeeId,
      error: null,
    });
  } catch (error) {
    return json({
      error,
      employeeId,
      employeeStatutoryDetailsData: null,
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
      schema: EmployeeStatutorySchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateEmployeeStatutoryDetails({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Statutory updated successfully",
        error: null,
      });
    }
    return json(
      { status: "error", message: "Statutory update failed", error },
      { status: 500 },
    );
  } catch (error) {
    return json({
      status: "error",
      message: "Statutory update failed",
      error,
    });
  }
}

export default function UpdateStatutoryDetails() {
  const { employeeStatutoryDetailsData, error, employeeId } =
    useLoaderData<typeof loader>();
  console.log(employeeStatutoryDetailsData, "dwefwe");
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = EmployeeStatutorySchema;

  const [form, fields] = useForm({
    id: UPDATE_EMPLOYEE_STATUTORY,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: employeeStatutoryDetailsData,
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_overview}${employeeId}`,
        );
        toast({
          title: "Success",
          description: actionData?.message || "Employee updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Employee update failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}/overview`);
    }
  }, [actionData]);

  if (error)
    return (
      <ErrorBoundary error={error} message="Failed to load statutory details" />
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
            <CreateEmployeeStatutoryDetails
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

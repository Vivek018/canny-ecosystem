import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Await,
  defer,
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  isGoodStatus,
  EmployeeGuardiansSchema,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { getEmployeeGuardianById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeGuardian } from "@canny_ecosystem/supabase/mutations";
import { Suspense, useEffect, useState } from "react";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { CreateEmployeeGuardianDetails } from "@/components/employees/form/create-employee-guardian-details";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { EmployeeGuardianDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";

export const UPDATE_EMPLOYEE_GUARDIAN = "update-employee-guardian";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const guardianId = params.guardianId;
  const employeeId = params.employeeId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.employeeGuardians}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let employeeGuardian = null;

    if (guardianId) {
      employeeGuardian = getEmployeeGuardianById({
        supabase,
        id: guardianId,
      });
    } else {
      throw new Error("No guardianId provided");
    }

    return defer({
      employeeGuardian,
      employeeId,
      error: null,
    });
  } catch (error) {
    return json({
      error,
      employeeId,
      employeeGuardian: null,
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
      schema: EmployeeGuardiansSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateEmployeeGuardian({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee guardian updated successfully",
        error: null,
      });
    }

    return json(
      {
        status: "error",
        message: "Employee guardian update failed",
        error,
      },
      { status: 500 }
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    });
  }
}

export default function UpdateEmployeeGuardian() {
  const { employeeGuardian, employeeId } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={employeeGuardian}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load employee details" />;
          return (
            <UpdateEmployeeGuardianWrapper
              data={resolvedData.data}
              error={resolvedData.error}
              employeeId={employeeId}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateEmployeeGuardianWrapper({
  data,
  error,
  employeeId,
}: {
  data: EmployeeGuardianDatabaseUpdate | null;
  error: Error | null | { message: string };
  employeeId: string | undefined;
}) {
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = EmployeeGuardiansSchema;

  const [form, fields] = useForm({
    id: UPDATE_EMPLOYEE_GUARDIAN,
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

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Guardian updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Guardian update failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}`);
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
            <CreateEmployeeGuardianDetails
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

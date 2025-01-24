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
  EmployeeAddressesSchema,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { getEmployeeAddressById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeAddress } from "@canny_ecosystem/supabase/mutations";
import { Suspense, useEffect, useState } from "react";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { CreateEmployeeAddress } from "@/components/employees/form/create-employee-address";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { EmployeeAddressDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";

export const UPDATE_EMPLOYEE_ADDRESS = "update-employee-address";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const addressId = params.addressId;
  const employeeId = params.employeeId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(`${user?.role!}`, `${updateRole}:employee_addresses`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let employeeAddressPromise = null;

    if (addressId) {
      employeeAddressPromise = getEmployeeAddressById({
        supabase,
        id: addressId,
      });
    }

    return defer({
      employeeAddressPromise,
      employeeId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        employeeId,
        employeeAddressPromise: null,
      },
      { status: 500 }
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: EmployeeAddressesSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateEmployeeAddress({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee address updated successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to update employee address",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export default function UpdateEmployeeAddress() {
  const { employeeAddressPromise, employeeId, error } =
    useLoaderData<typeof loader>();

  if (error)
    return (
      <ErrorBoundary error={error} message="Failed to load employee details" />
    );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={employeeAddressPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load employee details" />;
          return (
            <UpdateEmployeeAddressWrapper
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

export function UpdateEmployeeAddressWrapper({
  data,
  error,
  employeeId,
}: {
  data: EmployeeAddressDatabaseUpdate | null;
  error: Error | null | { message: string };
  employeeId: string | undefined;
}) {
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = EmployeeAddressesSchema;

  const [form, fields] = useForm({
    id: UPDATE_EMPLOYEE_ADDRESS,
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
        description: error?.message || "Employee address update failed",
        variant: "destructive",
      });
    }
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Employee address updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Employee address update failed",
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
            <CreateEmployeeAddress
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

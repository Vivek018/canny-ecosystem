import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getEmployeeBankDetailsById } from "@canny_ecosystem/supabase/queries";
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
import { updateEmployeeBankDetails } from "@canny_ecosystem/supabase/mutations";
import {
  isGoodStatus,
  EmployeeBankDetailsSchema,
} from "@canny_ecosystem/utils";
import { CreateEmployeeBankDetails } from "@/components/employees/form/create-employee-bank-details";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { Suspense, useEffect, useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { EmployeeBankDetailsDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";

export const UPDATE_BANK_DETAILS = "update-employee-bank-details";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    let employeeBankDetailsPromise = null;

    if (employeeId) {
      employeeBankDetailsPromise = getEmployeeBankDetailsById({
        supabase,
        id: employeeId,
      });
    } else {
      throw new Error("No employeeId provided");
    }

    return defer({
      employeeBankDetailsPromise,
      error: null,
      employeeId,
    });
  } catch (error) {
    return json({
      error,
      employeeId,
      employeeBankDetailsPromise: null,
    });
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: EmployeeBankDetailsSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateEmployeeBankDetails({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee bank details updated successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Employee bank details update failed",
    error,
  });
}

export default function UpdateEmployeeBankDetails() {
  const { employeeBankDetailsPromise, employeeId, error } =
    useLoaderData<typeof loader>();

  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load employee bank details"
      />
    );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={employeeBankDetailsPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return (
              <ErrorBoundary message="Failed to load employee bank details" />
            );
          return (
            <UpdateEmployeeBankDetailsWrapper
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


export function UpdateEmployeeBankDetailsWrapper({
  data,
  error,
  employeeId,
}: {
  data: EmployeeBankDetailsDatabaseUpdate | null;
  error: Error | null | { message: string };
  employeeId: string | undefined;
}) {
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = EmployeeBankDetailsSchema;

  const [form, fields] = useForm({
    id: UPDATE_BANK_DETAILS,
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
          description: actionData?.message || "Employee bank details updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Employee bank details update failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}/work-portfolio`);
    }
  }, [actionData]);

  return (
    <section className="md:px-20 lg:px-28 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CreateEmployeeBankDetails
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

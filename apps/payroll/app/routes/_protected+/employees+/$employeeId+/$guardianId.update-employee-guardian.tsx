import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { isGoodStatus, EmployeeGuardiansSchema } from "@canny_ecosystem/utils";
import { getEmployeeGuardianById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeGuardian } from "@canny_ecosystem/supabase/mutations";
import { useEffect, useState } from "react";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { CreateEmployeeGuardianDetails } from "@/components/employees/form/create-employee-guardian-details";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const UPDATE_EMPLOYEE_GUARDIAN = "update-employee-guardian";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const guardianId = params.guardianId;
  const { supabase } = getSupabaseWithHeaders({ request });

  let data = null;
  let error = null;

  if (guardianId) {
    ({ data, error } = await getEmployeeGuardianById({
      supabase,
      id: guardianId,
    }));
  }

  if (error)
    return json({
      status: "error",
      message: "Failed to get employee guardian",
      data,
      error,
    });

  return json({
    status: "success",
    message: "Employee guardian found",
    data,
    error: null,
  });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: EmployeeGuardiansSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
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

  return json({
    status: "error",
    message: "Employee guardian update failed",
    error,
  }, { status: 500 });
}

export default function UpdateEmployeeGuardian() {
  const { data } = useLoaderData<typeof loader>();
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
      navigate(-1);
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

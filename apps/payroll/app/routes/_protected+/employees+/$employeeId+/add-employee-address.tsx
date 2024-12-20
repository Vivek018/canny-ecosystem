import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Form, json, useActionData, useNavigate } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { createEmployeeAddresses } from "@canny_ecosystem/supabase/mutations";
import {
  isGoodStatus,
  EmployeeAddressesSchema,
  getInitialValueFromZod,
} from "@canny_ecosystem/utils";
import { CreateEmployeeAddress } from "@/components/employees/form/create-employee-address";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const ADD_EMPLOYEE_ADDRESS = "add-employee-address";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {

  const employeeId = params.employeeId;
  
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    
    if (!employeeId) {
      return json({
      status: "error",
      message: "Invalid employee id",
      returnTo: "/employees",
    });
  }

  const submission = parseWithZod(formData, {
    schema: EmployeeAddressesSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }
  
  const { status, error } = await createEmployeeAddresses({
    supabase,
    data: { ...submission.value, employee_id: employeeId },
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Address added successfully",
      error: null,
      returnTo: `/employees/${employeeId}`,
    });
  }
  return json({ status, error });
} catch (error) {
  return json({
    status: "error",
    message: "An unexpected error occurred",
    error,
  })
}
}

export default function AddEmployeeAddress() {
  const [resetKey, setResetKey] = useState(Date.now());
  const currentSchema = EmployeeAddressesSchema;

  const initialValues = getInitialValueFromZod(currentSchema);

  const [form, fields] = useForm({
    id: ADD_EMPLOYEE_ADDRESS,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: initialValues,
  });

  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Address added",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Address add failed",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? -1);
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
            <CreateEmployeeAddress key={resetKey} fields={fields as any} />
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

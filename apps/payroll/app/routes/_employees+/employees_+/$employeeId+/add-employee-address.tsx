import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Form, json } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { createEmployeeAddresses } from "@canny_ecosystem/supabase/mutations";
import { isGoodStatus, EmployeeAddressesSchema, getInitialValueFromZod } from "@canny_ecosystem/utils";
import { CreateEmployeeAddress } from "@/components/employees/form/create-employee-address";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card, CardFooter } from "@canny_ecosystem/ui/card";
import { Button } from "@canny_ecosystem/ui/button";
import { useState } from "react";

export const ADD_EMPLOYEE_ADDRESS = "add-employee-address";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const employeeId = params.employeeId;
  if (!employeeId) {
    return safeRedirect("/employees");
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
    return safeRedirect(`/employees/${employeeId}`, {
      status: 303,
    });
  }
  return json({ status, error });
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

  return (
    <section className="lg:px-40 2xl:px-80 py-2">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CreateEmployeeAddress key={resetKey} fields={fields as any} />
            <CardFooter>
              <div className="ml-auto w-2/5 flex flex-row items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="full"
                  type="reset"
                  onClick={() => setResetKey(Date.now())}
                  {...form.reset.getButtonProps()}
                >
                  Reset
                </Button>
                <Button
                  form={form.id}
                  disabled={!form.valid}
                  variant="default"
                  size="full"
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </CardFooter>
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}

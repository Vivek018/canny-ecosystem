import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Form, json, useLoaderData } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { isGoodStatus, EmployeeGuardiansSchema } from "@canny_ecosystem/utils";
import { getEmployeeGuardianById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeGuardian } from "@canny_ecosystem/supabase/mutations";
import { useState } from "react";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card, CardFooter } from "@canny_ecosystem/ui/card";
import { CreateEmployeeGuardianDetails } from "@/components/employees/form/create-employee-guardian-details";
import { Button } from "@canny_ecosystem/ui/button";

export const UPDATE_EMPLOYEE_GUARDIAN = "update-employee-guardian";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const guardianId = params.guardianId;
  const { supabase } = getSupabaseWithHeaders({ request });

  let data = null;

  if (guardianId) {
    data = (await getEmployeeGuardianById({ supabase, id: guardianId })).data;
  }

  return json({ data });
}

export async function action({ request }: ActionFunctionArgs) {
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
    return safeRedirect(`/employees/${submission.value.employee_id}`, {
      status: 303,
    });
  }

  return json({ status, error });
}

export default function UpdateEmployeeGuardian() {
  const { data } = useLoaderData<typeof loader>();
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
            <CreateEmployeeGuardianDetails
              key={resetKey}
              fields={fields as any}
              isUpdate={true}
            />
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

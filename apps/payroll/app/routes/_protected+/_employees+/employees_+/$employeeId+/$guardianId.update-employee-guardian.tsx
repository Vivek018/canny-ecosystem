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
import { Card } from "@canny_ecosystem/ui/card";
import { CreateEmployeeGuardianDetails } from "@/components/employees/form/create-employee-guardian-details";
import { FormButtons } from "@/components/form/form-buttons";

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
      { status: submission.status === "error" ? 400 : 200 }
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
    <section className='md:px-20 lg:px-28 2xl:px-40 py-4'>
      <FormProvider context={form.context}>
        <Form
          method='POST'
          encType='multipart/form-data'
          {...getFormProps(form)}
          className='flex flex-col'
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

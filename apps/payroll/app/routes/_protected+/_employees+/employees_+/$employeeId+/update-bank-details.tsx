import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getEmployeeBankDetailsById } from "@canny_ecosystem/supabase/queries";
import { Form, json, useLoaderData } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { updateEmployeeBankDetails } from "@canny_ecosystem/supabase/mutations";
import {
  isGoodStatus,
  EmployeeBankDetailsSchema,
} from "@canny_ecosystem/utils";
import { CreateEmployeeBankDetails } from "@/components/employees/form/create-employee-bank-details";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { Card } from "@canny_ecosystem/ui/card";
import { useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";

export const UPDATE_BANK_DETAILS = "update-employee-bank-details";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;
  const { supabase } = getSupabaseWithHeaders({ request });

  let data = null;

  if (employeeId) {
    data = (
      await getEmployeeBankDetailsById({
        supabase,
        id: employeeId,
      })
    ).data;
  }

  return json({ data });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: EmployeeBankDetailsSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateEmployeeBankDetails({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect(`/employees/${submission.value?.employee_id}`, {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function UpdateEmployeeBankDetails() {
  const { data } = useLoaderData<typeof loader>();
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

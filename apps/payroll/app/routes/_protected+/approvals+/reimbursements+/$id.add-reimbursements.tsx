import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Form, json, useLoaderData } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  getInitialValueFromZod,
  isGoodStatus,
  ReimbursementSchema,
  ReimbursementStatusArray,
  replaceUnderscore,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { getEmployeeById } from "@canny_ecosystem/supabase/queries";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import { FormButtons } from "@/components/form/form-buttons";

import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { createReimbursementsFromData } from "@canny_ecosystem/supabase/mutations";


export const UPDATE_USER_TAG = "Update User";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const employeeId = params.id??"";

  const { data, error } = await getEmployeeById({
    supabase,

    id: employeeId,
  });

  if (error) {
    throw error;
  }

  return json({ data });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const employeeId = params.id;
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: ReimbursementSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }
  const reimbursementData={company_id:companyId, employee_id:employeeId,...submission.value as any}
  
  
    const { status, error } = await createReimbursementsFromData({
      supabase,
      data: reimbursementData,
    });

    if (isGoodStatus(status))
      return safeRedirect("/approvals/reimbursements", { status: 303 });

    return json({ status, error });
}

export default function AddReimbursements() {
  const { data } = useLoaderData<typeof loader>();

  const initialValues = data ?? getInitialValueFromZod(ReimbursementSchema);
  const [form, fields] = useForm({
    constraint: getZodConstraint(ReimbursementSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ReimbursementSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: initialValues,
  });

  return (
    <section className="md:px-20 lg:px-52 2xl:px-80 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>Add Reimbursements</CardTitle>
              <CardDescription className="">
                You can add reimbursements by filling this form
              </CardDescription>
            </CardHeader>
            <CardContent>
              
              <div className="grid grid-cols-2 place-content-center justify-between gap-x-8 mb-10">
                <Field
                  inputProps={{
                    ...getInputProps(fields.first_name, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.first_name.name
                    )}`,
                    className: "capitalize",
                    readOnly: true,
                    disabled:true
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.first_name.name),
                  }}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.last_name, { type: "text" }),

                    placeholder: `Enter ${replaceUnderscore(
                      fields.last_name.name
                    )}`,
                    className: "capitalize",
                    readOnly: true,
                    disabled:true
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.last_name.name),
                  }}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-x-8 mt-10">
                <Field
                  inputProps={{
                    ...getInputProps(fields.submitted_date, {
                      type: "date",
                    }),

                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.submitted_date.name),
                  }}
                />
                <SearchableSelectField
                  className="w-full capitalize flex-1"
                  options={transformStringArrayIntoOptions(
                    ReimbursementStatusArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.status, { type: "text" }),
                  }}
                  placeholder={`Select ${replaceUnderscore(
                    fields.status.name
                  )}`}
                  errors={fields.status.errors}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-x-8 mt-10">
                <Field
                  inputProps={{
                    ...getInputProps(fields.claimed_amount, {
                      type: "number",
                    }),

                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.claimed_amount.name),
                  }}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.approved_amount, {
                      type: "number",
                    }),

                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.approved_amount.name),
                  }}
                />
              </div>

              <CheckboxField
                className="mt-8"
                buttonProps={getInputProps(fields.is_deductible, {
                  type: "checkbox",
                })}
                labelProps={{
                  children: "Is Deductible?",
                }}
              />
            </CardContent>

            <FormButtons form={form} isSingle={true} />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}

import { isGoodStatus, PaymentFieldSchema, replaceUnderscore, getInitialValueFromZod, replaceDash } from "@canny_ecosystem/utils";
import { CheckboxField, Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, json, useLoaderData } from "@remix-run/react";
import { Button } from "@canny_ecosystem/ui/button";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { UPDATE_PAYMENT_FIELD } from "./$paymentFieldId.update-payment-field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@canny_ecosystem/ui/card";
import { createPaymentField } from "@canny_ecosystem/supabase/mutations";
import type { PaymentFieldDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { calculationType, paymentType } from "@canny_ecosystem/utils/constant";

export const CREATE_PAYMENT_FIELD = "create-payment-field";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  return json({ companyId });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: PaymentFieldSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await createPaymentField({
    supabase,
    data: submission.value as any,
  });

  if (isGoodStatus(status)) return safeRedirect("/payment-fields", { status: 303 });

  return json({ status, error });
}

export default function CreatePaymentField({ updateValues }: { updateValues?: PaymentFieldDatabaseUpdate | null }) {
  const { companyId } = useLoaderData<typeof loader>();
  const PAYMENT_FIELD_TAG = updateValues ? UPDATE_PAYMENT_FIELD : CREATE_PAYMENT_FIELD;

  const initialValues = updateValues ?? getInitialValueFromZod(PaymentFieldSchema);

  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: PAYMENT_FIELD_TAG,
    constraint: getZodConstraint(PaymentFieldSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PaymentFieldSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
    },
  });

  return (
    <section className="md:px-20 lg:px-52 2xl:px-80 py-3">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(PAYMENT_FIELD_TAG)}
              </CardTitle>
              <CardDescription>
                {PAYMENT_FIELD_TAG.split("-")[0]} payment field of a company that will be
                central in all of canny apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(fields.name.name)}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.name.name),
                }}
                errors={fields.name.errors}
              />
              <SearchableSelectField
                key={resetKey}
                className="capitalize"
                options={paymentType}
                inputProps={{
                  ...getInputProps(fields.payment_type, { type: "text" }),
                }}
                placeholder={`Select ${replaceUnderscore(fields.payment_type.name)}`}
                labelProps={{
                  children: replaceUnderscore(fields.payment_type.name),
                }}
                errors={fields.payment_type.errors}
              />

              <SearchableSelectField
                key={resetKey + 1}
                className="capitalize"
                options={calculationType}
                inputProps={{
                  ...getInputProps(fields.calculation_type, { type: "text" }),
                }}
                placeholder={`Select ${replaceUnderscore(fields.calculation_type.name)}`}
                labelProps={{
                  children: replaceUnderscore(fields.calculation_type.name),
                }}
                errors={fields.calculation_type.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.amount, { type: "number" }),
                  className: "capitalize",
                  placeholder: `Enter ${replaceUnderscore(fields.calculation_type.value === "fixed" ? fields.amount.name : "percentage")}`,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.calculation_type.value === "fixed" ? fields.amount.name : "percentage"),
                }}
                errors={fields.amount.errors}
                prefix={fields.calculation_type.value === "fixed" ? "Rs" : undefined}
                suffix={fields.calculation_type.value === "basic" ? "%" : undefined}
              />

              <div className="grid grid-cols-2 place-content-center justify-between gap-x-4">
                <CheckboxField
                  buttonProps={getInputProps(fields.is_active, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Mark this as Active",
                  }}
                />
                <CheckboxField
                  buttonProps={getInputProps(fields.is_pro_rata, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Calculate on pro-rata basis",
                  }}
                />

                <CheckboxField
                  buttonProps={getInputProps(fields.consider_for_epf, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Consider for EPF Contribution",
                  }}
                />

                <CheckboxField
                  buttonProps={getInputProps(fields.consider_for_esic, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Consider for ESI Contribution",
                  }}
                />
              </div>
            </CardContent>
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

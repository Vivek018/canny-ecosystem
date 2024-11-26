import { FormButtons } from "@/components/form/form-buttons";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { createEmployeeStateInsurance } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type {
  EmployeeStateInsuranceDatabaseRow,
  Json,
} from "@canny_ecosystem/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import {
  deductionCycleArray,
  EmployeeProvidentFundSchema,
  EmployeeStateInsuranceSchema,
  getInitialValueFromZod,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { UPDATE_EMPLOYEE_STATE_INSURANCE } from "./$esiId.update-esi";

export const CREATE_EMPLOYEE_STATE_INSURANCE =
  "create-employee-state-insurance";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: EmployeeStateInsuranceSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await createEmployeeStateInsurance({
    supabase,
    data: submission.value as any,
    bypassAuth: true,
  });

  if (isGoodStatus(status)) {
    return safeRedirect(
      "/payment-components/statutory-fields/employee-state-insurance",
      {
        status: 303,
      }
    );
  }

  return json({ status, error });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  return json({ companyId });
};

export default function CreateEmployeeStateInsurance({
  updateValues,
}: {
  updateValues?: Json;
}) {
  const EPF_TAG = updateValues
    ? UPDATE_EMPLOYEE_STATE_INSURANCE
    : CREATE_EMPLOYEE_STATE_INSURANCE;

  const initialValues =
    updateValues ?? getInitialValueFromZod(EmployeeStateInsuranceSchema);

  const { companyId } = useLoaderData<{ companyId: string }>();
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: EPF_TAG,
    constraint: getZodConstraint(EmployeeProvidentFundSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeStateInsuranceSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...(initialValues as {
        [key: string]: EmployeeStateInsuranceDatabaseRow | null;
      }),
      company_id: companyId,
    },
  });

  return (
    <section className="md-px-10 w-full lg:px-12 2xl:px-10 py-3">
      <Form method="POST" {...getFormProps(form)} className="flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl mb-4">
              {replaceDash(EPF_TAG)}
            </CardTitle>
            <hr />
          </CardHeader>
          <CardContent>
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <div className="flex flex-col w-1/3 justify-between">
              <Field
                inputProps={{
                  ...getInputProps(fields.esi_number, { type: "text" }),
                  autoFocus: true,
                  placeholder: "00-00-000000-000-0000",
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(fields.esi_number.name),
                }}
                errors={fields.esi_number.errors}
              />

              <SearchableSelectField
                key={resetKey}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  deductionCycleArray as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fields.deduction_cycle, { type: "text" }),
                }}
                placeholder="Select an option"
                labelProps={{
                  children: replaceUnderscore(fields.deduction_cycle.name),
                }}
                errors={fields.deduction_cycle.errors}
              />
            </div>
            <div className="flex flex-col w-2/5 justify-between">
              <div className="flex   items-center justify-between gap-4">
                <Field
                  className=""
                  inputProps={{
                    ...getInputProps(fields.employees_contribution, {
                      type: "number",
                    }),
                    disabled: true,
                    autoFocus: true,
                    placeholder: "Enter number",
                    className: "capitalize",
                  }}
                  labelProps={{
                    className: "capitalize",
                    children: replaceUnderscore(
                      fields.employees_contribution.name
                    ),
                  }}
                  errors={fields.employees_contribution.errors}
                />
                <p className="mb-5 w-1/2 font-[350] text-sm">of Gross Pay</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <Field
                  className=""
                  inputProps={{
                    ...getInputProps(fields.employers_contribution, {
                      type: "number",
                    }),
                    disabled: true,
                    autoFocus: true,
                    placeholder: "Enter number",
                    className: "capitalize",
                  }}
                  labelProps={{
                    className: "capitalize",
                    children: replaceUnderscore(
                      fields.employers_contribution.name
                    ),
                  }}
                  errors={fields.employers_contribution.errors}
                />
                <p className="w-1/2 mb-5 font-[350] text-sm">of Gross Pay</p>
              </div>
            </div>

            <CheckboxField
              buttonProps={getInputProps(fields.include_employer_contribution, {
                type: "checkbox",
              })}
              labelProps={{
                htmlFor: fields.include_employer_contribution.id,
                children: "Include employer's contribution in the CTC",
              }}
              className="items-center"
            />
          </CardContent>
          <FormButtons form={form} setResetKey={setResetKey} isSingle={true} />
        </Card>
      </Form>
    </section>
  );
}

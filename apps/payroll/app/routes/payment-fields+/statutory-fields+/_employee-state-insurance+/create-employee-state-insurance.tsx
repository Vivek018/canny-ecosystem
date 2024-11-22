import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { createEmployeeStateInsurance } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  EmployeeStateInsuranceDatabaseRow,
  Json,
} from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import {
  EmployeeProvidentFundSchema,
  EmployeeStateInsuranceSchema,
  getInitialValueFromZod,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import {
  deductionCycles,
  employeeContributionRate,
  employerContributionRate,
} from "@canny_ecosystem/utils/constant";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React from "react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  console.log("FORM---------------", formData);

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
      "/payment-fields/statutory-fields/employee-state-insurance",
      {
        status: 303,
      }
    );
  }

  console.log("--------------", status, error);

  return json({ status, error });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  return json({ companyId });
};

const CreateEmployeeStateInsurance = ({
  updateValues,
}: {
  updateValues?: Json;
}) => {
  const EPF_TAG = updateValues
    ? "update-employee-state-insurance"
    : "create-employee-state-insurance";

  const initialValues =
    updateValues ?? getInitialValueFromZod(EmployeeStateInsuranceSchema);
  console.log(initialValues);

  const { companyId } = useLoaderData<{ companyId: string }>();
  console.log(companyId);
  const [form, fields] = useForm({
    id: EPF_TAG,
    constraint: getZodConstraint(EmployeeProvidentFundSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeStateInsuranceSchema });
    },
    shouldValidate: "onInput",
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
            <CardTitle className="text-2xl">{replaceDash(EPF_TAG)}</CardTitle>
            <br />
            <br />
            <br />
            <hr />
          </CardHeader>
          <CardContent>
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <div className="grid grid-cols-[50%,33%] place-content-center justify-between gap-6">
              <Field
                inputProps={{
                  ...getInputProps(fields.esi_number, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(
                    fields.esi_number.name
                  )}`,
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(fields.esi_number.name),
                }}
                errors={fields.esi_number.errors}
              />

              <SearchableSelectField
                // key={resetKey}
                className="capitalize"
                options={deductionCycles}
                inputProps={{
                  ...getInputProps(fields.deduction_cycle, { type: "text" }),
                  defaultValue: deductionCycles[0].value,
                }}
                placeholder={`Select an option`}
                labelProps={{
                  children: replaceUnderscore(fields.deduction_cycle.name),
                }}
                errors={fields.deduction_cycle.errors}
              />
            </div>
            <div className="grid grid-cols-2 place-content-center justify-between gap-6">
              <div className="flex items-center text-center">
                <Field
                  className="w-[40%]"
                  inputProps={{
                    ...getInputProps(fields.employees_contribution, {
                      type: "number",
                    }),
                    disabled: true,
                    autoFocus: true,
                    placeholder: `Enter number`,
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
                <p className="w-[20%] mb-5 font-[350] text-sm">of Gross Pay</p>
              </div>
              <div className="flex items-center text-center">
                <Field
                  className="w-[40%]"
                  inputProps={{
                    ...getInputProps(fields.employers_contribution, {
                      type: "number",
                    }),
                    disabled: true,
                    autoFocus: true,
                    placeholder: `Enter number`,
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
                <p className="w-[20%] mb-5 font-[350] text-sm">of Gross Pay</p>
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
          <CardFooter>
            <div className="ml-auto w-2/5 flex flex-row items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="full"
                type="reset"
                  // onClick={() => setResetKey(Date.now())}
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
    </section>
  );
};

export default CreateEmployeeStateInsurance;

import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { createEmployeeProvidentFund } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type {
  EmployeeProvidentFundDatabaseRow,
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
  deductionCycleArray,
  EmployeeProvidentFundSchema,
  getInitialValueFromZod,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: EmployeeProvidentFundSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await createEmployeeProvidentFund({
    supabase,
    data: submission.value as any,
    bypassAuth: true,
  });

  if (isGoodStatus(status)) {
    return safeRedirect(
      "/payment-components/statutory-fields/employee-provident-fund",
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

const CreateEmployeeProvidentFund = ({
  updateValues,
}: {
  updateValues?: Json;
}) => {
  const EPF_TAG = updateValues
    ? "update-employee-provident-fund"
    : "create-employee-provident-fund";

  const initialValues =
    updateValues ?? getInitialValueFromZod(EmployeeProvidentFundSchema);

  const { companyId } = useLoaderData<{ companyId: string }>();
  const [form, fields] = useForm({
    id: EPF_TAG,
    constraint: getZodConstraint(EmployeeProvidentFundSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeProvidentFundSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...(initialValues as {
        [key: string]: EmployeeProvidentFundDatabaseRow | null;
      }),
      company_id: companyId,
    },
  });

  return (
    <section className="md-px-20 lg:px-52 2xl:px-10 py-3 w-full">
      <Form method="POST" {...getFormProps(form)} className="flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl pb-5">
              {replaceDash(EPF_TAG)}
            </CardTitle>
            <hr />
          </CardHeader>
          <CardContent>
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <div className="grid grid-rows-2 place-content-center justify-between">
              <Field
                inputProps={{
                  ...getInputProps(fields.epf_number, { type: "text" }),
                  autoFocus: true,
                  placeholder:"AA/AAA/0000000/XXX",
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(fields.epf_number.name),
                }}
                errors={fields.epf_number.errors}
              />

              <SearchableSelectField
                // key={resetKey}
                className="capitalize"
                options={transformStringArrayIntoOptions(deductionCycleArray as unknown as string[])}
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
            <div className="grid place-content-center justify-between pb-5 max-w-3/4">
              <CheckboxField
                buttonProps={getInputProps(
                  fields.restrict_employee_contribution,
                  {
                    type: "checkbox",
                  }
                )}
                labelProps={{
                  htmlFor: fields.restrict_employee_contribution.id,
                  children:
                    "Restrict employee's contribution to ₹15,000 of PF Wage",
                }}
                className="items-center"
              />
              <CheckboxField
                buttonProps={getInputProps(
                  fields.restrict_employer_contribution,
                  {
                    type: "checkbox",
                  }
                )}
                labelProps={{
                  htmlFor: fields.restrict_employer_contribution.id,
                  children:
                    "Restrict employer's contribution to ₹15,000 of PF Wage",
                }}
                className="items-center"
              />
            </div>
            <div className="relative h-full w-full">
              <CheckboxField
                buttonProps={getInputProps(
                  fields.include_employer_contribution,
                  {
                    type: "checkbox",
                  }
                )}
                labelProps={{
                  htmlFor: fields.include_employer_contribution.id,
                  children: "Include employer's contribution in the CTC",
                }}
                className="items-center"
              />
              {form.value?.include_employer_contribution && (
                <>
                  <div className="ml-8">
                    <CheckboxField
                      buttonProps={{
                        ...getInputProps(
                          fields.include_employer_edli_contribution,
                          {
                            type: "checkbox",
                          }
                        ),
                        disabled: !form.value?.include_employer_contribution,
                      }}
                      labelProps={{
                        htmlFor: fields.include_employer_edli_contribution.id,
                        children:
                          "Include employer's EDLI contribution in the CTC",
                      }}
                      className="items-center"
                    />
                    <CheckboxField
                      buttonProps={{
                        disabled: !form.value?.include_employer_contribution,
                        ...getInputProps(fields.include_admin_charges, {
                          type: "checkbox",
                        }),
                      }}
                      labelProps={{
                        htmlFor: fields.include_admin_charges.id,
                        children: "Include admin charges in the CTC",
                      }}
                      className="items-center"
                    />
                  </div>

                  <div className="absolute h-full top-2/3 left-4 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="h-[30px] w-[15px] border-l-2 border-b-2 border-gray-300" />
                    <div className="h-[45px] w-[15px] border-l-2 border-b-2 border-gray-300" />
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="ml-auto w-2/5 flex flex-row items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="full"
                type="reset"
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

export default CreateEmployeeProvidentFund;

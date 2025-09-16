import { FormButtons } from "@/components/form/form-buttons";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { createEmployeeProvidentFund } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { EmployeeProvidentFundDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  CheckboxField,
  Field,
  JSONBField,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import {
  deductionCycleArray,
  EmployeeProvidentFundSchema,
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  createRole,
} from "@canny_ecosystem/utils";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { UPDATE_EMPLOYEE_PROVIDENT_FUND } from "./$epfId.update-epf";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const CREATE_EMPLOYEE_PROVIDENT_FUND = "create-employee-provident-fund";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${createRole}:${attribute.statutoryFieldsEpf}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    return json({
      companyId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        companyId: null,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: EmployeeProvidentFundSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await createEmployeeProvidentFund({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee Provident Fund created",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to create Employee Provident Fund",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to create Employee Provident Fund",
        error,
      },
      { status: 500 },
    );
  }
}

export default function CreateEmployeeProvidentFund({
  updateValues,
}: {
  updateValues?: EmployeeProvidentFundDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<{ companyId: string }>();
  const actionData = useActionData<typeof action>();
  const EPF_TAG = updateValues
    ? UPDATE_EMPLOYEE_PROVIDENT_FUND
    : CREATE_EMPLOYEE_PROVIDENT_FUND;

  const initialValues =
    updateValues ?? getInitialValueFromZod(EmployeeProvidentFundSchema);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: EPF_TAG,
    constraint: getZodConstraint(EmployeeProvidentFundSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeProvidentFundSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: companyId,
      terms:
        JSON.stringify(initialValues.terms) ??
        JSON.stringify({
          fields: "basic",
        }),
    },
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.statutory_field_epf);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          (actionData?.error as any)?.message || actionData?.error?.message,
        variant: "destructive",
      });
    }
    navigate("/payment-components/statutory-fields/employee-provident-fund");
  }, [actionData]);

  return (
    <section className="p-4 w-full">
      <Form method="POST" {...getFormProps(form)} className="flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl pb-5 capitalize">
              {replaceDash(EPF_TAG)}
            </CardTitle>
            <hr />
          </CardHeader>
          <CardContent>
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <input {...getInputProps(fields.is_default, { type: "hidden" })} />
            <div className="flex flex-col justify-between">
              <Field
                inputProps={{
                  ...getInputProps(fields.epf_number, { type: "text" }),
                  autoFocus: true,
                  placeholder: "AA/AAA/0000000/XXX",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.epf_number.name),
                }}
                errors={fields.epf_number.errors}
              />
              <JSONBField
                key={resetKey + 1}
                labelProps={{ children: "Terms" }}
                inputProps={{
                  ...getInputProps(fields.terms, { type: "hidden" }),
                }}
                errors={fields.terms.errors}
              />
              <SearchableSelectField
                key={resetKey}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  deductionCycleArray as unknown as string[],
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
            <div className="flex flex-col justify-between pb-5">
              <CheckboxField
                buttonProps={getInputProps(
                  fields.restrict_employee_contribution,
                  {
                    type: "checkbox",
                  },
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
                  },
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
                  },
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
                          },
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
          <FormButtons form={form} setResetKey={setResetKey} isSingle={true} />
        </Card>
      </Form>
    </section>
  );
}

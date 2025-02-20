import { FormButtons } from "@/components/form/form-buttons";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { createEmployeeStateInsurance } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { EmployeeStateInsuranceDatabaseUpdate } from "@canny_ecosystem/supabase/types";
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
  EmployeeStateInsuranceSchema,
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
import { UPDATE_EMPLOYEE_STATE_INSURANCE } from "./$esiId.update-esi";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const CREATE_EMPLOYEE_STATE_INSURANCE =
  "create-employee-state-insurance";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${createRole}:${attribute.statutoryFieldsEsi}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    return json({ companyId, error: null });
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
      schema: EmployeeStateInsuranceSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await createEmployeeStateInsurance({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee State Insurance created successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to create Employee State Insurance",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 },
    );
  }
}

export default function CreateEmployeeStateInsurance({
  updateValues,
}: {
  updateValues?: EmployeeStateInsuranceDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<{ companyId: string }>();
  const actionData = useActionData<typeof action>();
  const EPF_TAG = updateValues
    ? UPDATE_EMPLOYEE_STATE_INSURANCE
    : CREATE_EMPLOYEE_STATE_INSURANCE;

  const initialValues =
    updateValues ?? getInitialValueFromZod(EmployeeStateInsuranceSchema);

  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: EPF_TAG,
    constraint: getZodConstraint(EmployeeStateInsuranceSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmployeeStateInsuranceSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: companyId,
    },
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.statutory_field_esi);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.message,
        variant: "destructive",
      });
    }
    navigate("/payment-components/statutory-fields/employee-state-insurance");
  }, [actionData]);

  return (
    <section className="p-4 w-full">
      <Form method="POST" {...getFormProps(form)} className="flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl mb-4 capitalize">
              {replaceDash(EPF_TAG)}
            </CardTitle>
            <hr />
          </CardHeader>
          <CardContent>
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <div className="flex flex-col justify-between">
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
            <div className="flex flex-col justify-between">
              <div className="flex items-center justify-between gap-4">
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
                      fields.employees_contribution.name,
                    ),
                  }}
                  errors={fields.employees_contribution.errors}
                />
                <p className="mb-5 w-1/2 font-light text-sm">of Gross Pay</p>
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
                      fields.employers_contribution.name,
                    ),
                  }}
                  errors={fields.employers_contribution.errors}
                />
                <p className="w-1/2 mb-5 font-light text-sm">of Gross Pay</p>
              </div>
            </div>
            <Field
              className=""
              inputProps={{
                ...getInputProps(fields.max_limit, {
                  type: "number",
                }),
                disabled: true,
                autoFocus: true,
                placeholder: "Enter number",
                className: "capitalize",
              }}
              labelProps={{
                className: "capitalize",
                children: replaceUnderscore(fields.max_limit.name),
              }}
              errors={fields.max_limit.errors}
            />

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

import {
  isGoodStatus,
  PaymentFieldSchema,
  replaceUnderscore,
  getInitialValueFromZod,
  replaceDash,
  paymentTypeArray,
  transformStringArrayIntoOptions,
  calculationTypeArray,
  hasPermission,
  createRole,
} from "@canny_ecosystem/utils";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { UPDATE_PAYMENT_FIELD } from "./$paymentFieldId+/update-payment-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { createPaymentField } from "@canny_ecosystem/supabase/mutations";
import type { PaymentFieldDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { FormButtons } from "@/components/form/form-buttons";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const CREATE_PAYMENT_FIELD = "create-payment-field";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.paymentFields}`)) {
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
      { status: 500 }
    );
  }
}

export type ActionResponse = {
  status: number;
  error?: string;
};

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, {
      schema: PaymentFieldSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createPaymentField({
      supabase,
      data: submission.value as any,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Payment Field created",
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Payment Field creation failed",
        error,
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export default function CreatePaymentField({
  updateValues,
}: {
  updateValues?: PaymentFieldDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const PAYMENT_FIELD_TAG = updateValues
    ? UPDATE_PAYMENT_FIELD
    : CREATE_PAYMENT_FIELD;

  const initialValues =
    updateValues ?? getInitialValueFromZod(PaymentFieldSchema);

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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.payment_fields);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message || "Payment Field creation failed",
        variant: "destructive",
      });
    }
    navigate("/payment-components/payment-fields", {
      replace: true,
    });
  }, [actionData]);

  return (
    <section className='px-4 lg:px-10 xl:px-14 2xl:px-40 py-4'>
      <FormProvider context={form.context}>
        <Form method='POST' {...getFormProps(form)} className='flex flex-col'>
          <Card>
            <CardHeader>
              <CardTitle className='text-3xl capitalize'>
                {replaceDash(PAYMENT_FIELD_TAG)}
              </CardTitle>
              <CardDescription>
                {PAYMENT_FIELD_TAG.split("-")[0]} payment field of a company
                that will be central in all of canny apps
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
                className='capitalize'
                options={transformStringArrayIntoOptions(
                  paymentTypeArray as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fields.payment_type, { type: "text" }),
                }}
                placeholder={`Select ${replaceUnderscore(
                  fields.payment_type.name
                )}`}
                labelProps={{
                  children: replaceUnderscore(fields.payment_type.name),
                }}
                errors={fields.payment_type.errors}
              />

              <SearchableSelectField
                key={resetKey + 1}
                className='capitalize'
                options={transformStringArrayIntoOptions(
                  calculationTypeArray as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fields.calculation_type, { type: "text" }),
                }}
                placeholder={`Select ${replaceUnderscore(
                  fields.calculation_type.name
                )}`}
                labelProps={{
                  children: replaceUnderscore(fields.calculation_type.name),
                }}
                errors={fields.calculation_type.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.amount, { type: "number" }),
                  className: "capitalize",
                  placeholder: `Enter ${replaceUnderscore(
                    fields.calculation_type.value === calculationTypeArray[0]
                      ? fields.amount.name
                      : "Percentage"
                  )}`,
                  disabled: fields.payment_type.value === paymentTypeArray[1],
                }}
                labelProps={{
                  children: replaceUnderscore(
                    fields.calculation_type.value === calculationTypeArray[0]
                      ? fields.amount.name
                      : "percentage"
                  ),
                }}
                errors={fields.amount.errors}
                prefix={
                  fields.calculation_type.value === calculationTypeArray[0] ||
                  fields.calculation_type.value === undefined
                    ? "Rs"
                    : undefined
                }
                suffix={
                  fields.calculation_type.value === calculationTypeArray[1]
                    ? "%"
                    : undefined
                }
                className={cn(
                  fields.payment_type.value === paymentTypeArray[1] && "hidden"
                )}
              />

              <div className='grid grid-cols-2 place-content-center justify-between gap-x-4'>
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

import {
  hasPermission,
  isGoodStatus,
  PayeeSchema,
  replaceUnderscore,
  createRole,
  reimbursementTypeArray,
  accountTypeArray,
} from "@canny_ecosystem/utils";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { getInitialValueFromZod, replaceDash } from "@canny_ecosystem/utils";
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

import { createPayeeById } from "@canny_ecosystem/supabase/mutations";
import type { PayeeDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { UPDATE_PAYEE_TAG } from "./$payeeId.update-payee";
import { transformStringArrayIntoOptions } from "@canny_ecosystem/utils";

export const CREATE_PAYEE_TAG = "create-payee";

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.settingPayee}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {
    return json({
      status: "success",
      message: "Payee form loaded",
      companyId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        companyId,
        error,
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
      schema: PayeeSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await createPayeeById({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Payee created successfully",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to create payee",
      error,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    });
  }
}

export default function CreatePayee({
  updateValues,
}: {
  updateValues?: PayeeDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const PAYEE_TAG = updateValues ? UPDATE_PAYEE_TAG : CREATE_PAYEE_TAG;
  const [resetKey, setResetKey] = useState(Date.now());

  const initialValues = updateValues ?? getInitialValueFromZod(PayeeSchema);

  const [form, fields] = useForm({
    id: PAYEE_TAG,
    constraint: getZodConstraint(PayeeSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PayeeSchema });
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
      clearExactCacheEntry(cacheKeyPrefix.payee);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData.error?.message ?? "Payee creation failed",
        variant: "destructive",
      });
    }
    navigate("/settings/payee", { replace: true });
  }, [actionData]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl capitalize">
                {replaceDash(PAYEE_TAG)}
              </CardTitle>
              <CardDescription>{PAYEE_TAG.split("-")[0]} payee</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8">
                <Field
                  inputProps={{
                    ...getInputProps(fields.name, { type: "text" }),
                    autoFocus: true,
                    placeholder: `Enter ${replaceUnderscore(fields.name.name)}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.name.name),
                  }}
                  errors={fields.name.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  className="mb-2"
                  options={transformStringArrayIntoOptions(
                    reimbursementTypeArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.type, { type: "text" }),
                  }}
                  placeholder={`Select ${replaceUnderscore(fields.type.name)}`}
                  labelProps={{
                    children: replaceUnderscore(fields.type.name),
                  }}
                  errors={fields.type.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8">
                <Field
                  inputProps={{
                    ...getInputProps(fields.fixed_amount, { type: "number" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.fixed_amount.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.fixed_amount.name),
                  }}
                  errors={fields.fixed_amount.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8">
                <Field
                  inputProps={{
                    ...getInputProps(fields.bank_name, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.bank_name.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.bank_name.name),
                  }}
                  errors={fields.bank_name.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.account_holder_name, {
                      type: "text",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.account_holder_name.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(
                      fields.account_holder_name.name,
                    ),
                  }}
                  errors={fields.account_holder_name.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8">
                <Field
                  inputProps={{
                    ...getInputProps(fields.account_number, { type: "number" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.account_number.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.account_number.name),
                  }}
                  errors={fields.account_number.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.ifsc_code, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.ifsc_code.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.ifsc_code.name),
                  }}
                  errors={fields.ifsc_code.errors}
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8">
                <Field
                  inputProps={{
                    ...getInputProps(fields.branch_name, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.branch_name.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.branch_name.name),
                  }}
                  errors={fields.branch_name.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  className="mb-2"
                  options={transformStringArrayIntoOptions(
                    accountTypeArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.account_type, {
                      type: "text",
                    }),
                  }}
                  placeholder={`Select ${replaceUnderscore(fields.account_type.name)}`}
                  labelProps={{
                    children: replaceUnderscore(fields.account_type.name),
                  }}
                  errors={fields.account_type.errors}
                />
              </div>

              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-x-8">
                <Field
                  inputProps={{
                    ...getInputProps(fields.aadhaar_number, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.aadhaar_number.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.aadhaar_number.name),
                  }}
                  errors={fields.aadhaar_number.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.pan_number, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.pan_number.name,
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.pan_number.name),
                  }}
                  errors={fields.pan_number.errors}
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

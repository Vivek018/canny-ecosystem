import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  reimbursementStatusArray,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  createRole,
  NonEmployeeReimbursementSchema,
} from "@canny_ecosystem/utils";

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
import { createReimbursementsFromData } from "@canny_ecosystem/supabase/mutations";
import type {
  ReimbursementInsert,
  ReimbursementsUpdate,
} from "@canny_ecosystem/supabase/types";
import { useEffect, useState } from "react";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import { UPDATE_NONEMPLOYEE_REIMBURSEMENTS_TAG } from "./$reimbursementId.nonemployee-update-reimbursements";

export const ADD_NONEMPLOYEE_REIMBURSEMENTS_TAG =
  "Add_Non-Employee_Reimbursement";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${createRole}:${attribute.employeeReimbursements}`
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  return json({ companyId });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: NonEmployeeReimbursementSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await createReimbursementsFromData({
    supabase,
    data: submission.value as unknown as ReimbursementInsert[],
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Non Employee reimbursement create successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Non Employee reimbursement create failed",
    error,
  });
}

export default function AddNonEmployeeReimbursements({
  updateValues,
}: {
  updateValues?: ReimbursementsUpdate | null;
}) {
  const { companyId } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.employee_reimbursements}`);
        clearCacheEntry(cacheKeyPrefix.reimbursements);
        toast({
          title: "Success",
          description:
            actionData?.message || "Non Employee Reimbursement created",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ?? "Non Employee Reimbursement create failed",
          variant: "destructive",
        });
      }
      navigate("/approvals/reimbursements");
    }
  }, [actionData]);

  const REIMBURSEMENTS_TAG = updateValues
    ? UPDATE_NONEMPLOYEE_REIMBURSEMENTS_TAG
    : ADD_NONEMPLOYEE_REIMBURSEMENTS_TAG;

  const initialValues =
    updateValues ?? getInitialValueFromZod(NonEmployeeReimbursementSchema);

  const [form, fields] = useForm({
    id: REIMBURSEMENTS_TAG,
    constraint: getZodConstraint(NonEmployeeReimbursementSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: NonEmployeeReimbursementSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
    },
  });

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">
                {replaceUnderscore(REIMBURSEMENTS_TAG)}
              </CardTitle>
              <CardDescription className="lowercase">
                {`${replaceUnderscore(
                  REIMBURSEMENTS_TAG
                )} by filling this form`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />

              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />

              <div className="grid grid-cols-2 place-content-center justify-between gap-x-8 mt-10">
                <Field
                  inputProps={{
                    ...getInputProps(fields.name, {
                      type: "text",
                    }),
                    placeholder: `Enter ${replaceUnderscore(fields.name.name)}`,
                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.name.name),
                  }}
                  errors={fields.name.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.amount, {
                      type: "number",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.amount.name
                    )}`,
                    className: "",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.amount.name),
                  }}
                  errors={fields.amount.errors}
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
                  errors={fields.submitted_date.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  className="w-full capitalize flex-1 "
                  options={transformStringArrayIntoOptions(
                    reimbursementStatusArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.status, { type: "text" }),
                  }}
                  placeholder={`Select ${replaceUnderscore(
                    fields.status.name
                  )}`}
                  labelProps={{
                    children: "Status",
                  }}
                  errors={fields.status.errors}
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

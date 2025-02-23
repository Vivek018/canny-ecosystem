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
  ReimbursementSchema,
  reimbursementStatusArray,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  createRole,
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
import type { ReimbursementsUpdate } from "@canny_ecosystem/supabase/types";
import { UPDATE_REIMBURSEMENTS_TAG } from "../../../approvals+/reimbursements+/$reimbursementId.update-reimbursements";
import {
  getUsersByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { useEffect, useState } from "react";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";

export const ADD_REIMBURSEMENTS_TAG = "Add_Reimbursement";

export async function loader({ request, params }: LoaderFunctionArgs) {
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
  const employeeId = params.employeeId;

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: userData, error: userError } = await getUsersByCompanyId({
    supabase,
    companyId,
  });
  if (userError || !userData) {
    throw userError;
  }

  const userOptions = userData.map((userData) => ({
    label: userData.email?.toLowerCase() ?? "",
    value: userData.id,
  }));

  return json({ userOptions, companyId, employeeId });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: ReimbursementSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await createReimbursementsFromData({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee reimbursement create successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Employee reimbursement create failed",
    error,
  });
}

export default function AddReimbursements({
  updateValues,
  userOptionsFromUpdate,
}: {
  updateValues?: ReimbursementsUpdate | null;
  userOptionsFromUpdate?: any;
  reimbursementId?: string;
}) {
  const { userOptions, employeeId, companyId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(
          `${cacheKeyPrefix.employee_reimbursements}${employeeId}`
        );
        toast({
          title: "Success",
          description: actionData?.message || "Employee bank details created",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Employee bank details create failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}/reimbursements`);
    }
  }, [actionData]);

  const REIMBURSEMENTS_TAG = updateValues
    ? UPDATE_REIMBURSEMENTS_TAG
    : ADD_REIMBURSEMENTS_TAG;

  const initialValues =
    updateValues ?? getInitialValueFromZod(ReimbursementSchema);

  const [form, fields] = useForm({
    id: REIMBURSEMENTS_TAG,
    constraint: getZodConstraint(ReimbursementSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ReimbursementSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
      employee_id: initialValues.employee_id ?? employeeId,
    },
  });

  return (
    <section className='px-4 lg:px-10 xl:px-14 2xl:px-40 py-4'>
      <FormProvider context={form.context}>
        <Form method='POST' {...getFormProps(form)} className='flex flex-col'>
          <Card>
            <CardHeader>
              <CardTitle className='capitalize'>
                {replaceUnderscore(REIMBURSEMENTS_TAG)}
              </CardTitle>
              <CardDescription className='lowercase'>
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
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <div className='grid grid-cols-2 place-content-center justify-between gap-x-8 mt-10'>
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
                  className='w-full capitalize flex-1 '
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
              <div className='grid grid-cols-2 place-content-center justify-between gap-x-8 mt-10'>
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
                <SearchableSelectField
                  key={resetKey + 1}
                  inputProps={{
                    ...getInputProps(fields.user_id, {
                      type: "text",
                    }),
                    placeholder: "Select an authority that approved",
                  }}
                  className='lowercase'
                  options={userOptions ?? userOptionsFromUpdate}
                  labelProps={{
                    children: "Approved By",
                  }}
                  errors={fields.user_id.errors}
                />
              </div>

              <CheckboxField
                className='mt-8'
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

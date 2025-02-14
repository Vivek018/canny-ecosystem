import { FormButtons } from "@/components/form/form-buttons";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  createGratuity,
  createLeaveEncashment,
} from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type {
  GratuityDatabaseUpdate,
  LeaveEncashmentDatabaseUpdate,
} from "@canny_ecosystem/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import {
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
  createRole,
  LeaveEncashmentSchema,
  transformStringArrayIntoOptions,
  EncashmentFreqArray,
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
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { UPDATE_LEAVE_ENCASHMENT } from "./$leaveEncashmentId.update-leave-encashment";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const CREATE_LEAVE_ENCASHMENT = "create-leave-encashment";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${createRole}:${attribute.statutoryFieldsLeaveEncashment}`,
    )
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
      schema: LeaveEncashmentSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await createLeaveEncashment({
      supabase,
      data: submission.value as any,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Leave encashment created",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to create leave encashment",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to create leave encashment",
        error,
      },
      { status: 500 },
    );
  }
}

export default function CreateLeaveEncashment({
  updateValues,
}: {
  updateValues?: LeaveEncashmentDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<{ companyId: string }>();
  const actionData = useActionData<typeof action>();
  const LEAVE_ENCASHMENT_TAG = updateValues
    ? UPDATE_LEAVE_ENCASHMENT
    : CREATE_LEAVE_ENCASHMENT;

  const initialValues =
    updateValues ?? getInitialValueFromZod(LeaveEncashmentSchema);

  const [form, fields] = useForm({
    id: LEAVE_ENCASHMENT_TAG,
    constraint: getZodConstraint(LeaveEncashmentSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LeaveEncashmentSchema });
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
      clearExactCacheEntry(cacheKeyPrefix.leave_encashment);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message,
        variant: "destructive",
      });
    }
    navigate("/payment-components/statutory-fields/leave-encashment");
  }, [actionData]);

  return (
    <section className="p-4 w-full">
      <Form method="POST" {...getFormProps(form)} className="flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl pb-5 capitalize">
              {replaceDash(LEAVE_ENCASHMENT_TAG)}
            </CardTitle>
            <hr />
          </CardHeader>
          <CardContent>
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <input {...getInputProps(fields.is_default, { type: "hidden" })} />
            <div className="grid grid-cols-2 gap-6">
              <Field
                inputProps={{
                  ...getInputProps(fields.eligible_years, {
                    type: "number",
                  }),
                  autoFocus: true,
                  placeholder: replaceUnderscore(fields.eligible_years.name),
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(fields.eligible_years.name),
                }}
                errors={fields.eligible_years.errors}
              />

              <SearchableSelectField
                // key={resetKey}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  EncashmentFreqArray as unknown as string[],
                )}
                inputProps={{
                  ...getInputProps(fields.encashment_frequency, {
                    type: "text",
                  }),
                }}
                placeholder="Select an option"
                labelProps={{
                  children: replaceUnderscore(fields.encashment_frequency.name),
                }}
                errors={fields.encashment_frequency.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.encashment_multiplier, {
                    type: "number",
                  }),
                  autoFocus: true,
                  placeholder: replaceUnderscore(
                    fields.encashment_multiplier.name,
                  ),
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(
                    fields.encashment_multiplier.name,
                  ),
                }}
                errors={fields.encashment_multiplier.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.max_encashable_leaves, {
                    type: "number",
                  }),
                  autoFocus: true,
                  placeholder: replaceUnderscore(
                    fields.max_encashable_leaves.name,
                  ),
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(
                    fields.max_encashable_leaves.name,
                  ),
                }}
                errors={fields.max_encashable_leaves.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.max_encashment_amount, {
                    type: "number",
                  }),
                  autoFocus: true,
                  placeholder: replaceUnderscore(
                    fields.max_encashment_amount.name,
                  ),
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(
                    fields.max_encashment_amount.name,
                  ),
                }}
                errors={fields.max_encashment_amount.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.working_days_per_year, {
                    type: "number",
                  }),
                  autoFocus: true,
                  placeholder: replaceUnderscore(
                    fields.working_days_per_year.name,
                  ),
                  className: "capitalize",
                }}
                labelProps={{
                  className: "capitalize",
                  children: replaceUnderscore(
                    fields.working_days_per_year.name,
                  ),
                }}
                errors={fields.working_days_per_year.errors}
              />
            </div>
          </CardContent>
          <FormButtons form={form} isSingle={true} />
        </Card>
      </Form>
    </section>
  );
}

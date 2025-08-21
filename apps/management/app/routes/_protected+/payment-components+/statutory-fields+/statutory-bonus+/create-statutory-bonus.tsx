import { FormButtons } from "@/components/form/form-buttons";
import { createStatutoryBonus } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { StatutoryBonusDatabaseUpdate } from "@canny_ecosystem/supabase/types";
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
  statutoryBonusPayFrequencyArray,
  StatutoryBonusSchema,
  transformStringArrayIntoOptions,
  createRole,
} from "@canny_ecosystem/utils";
import { attribute, payoutMonths } from "@canny_ecosystem/utils/constant";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { UPDATE_STATUTORY_BONUS } from "./$sbId.update-statutory-bonus";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { useCompanyId } from "@/utils/company";
import { clearExactCacheEntry } from "@/utils/cache";

export const CREATE_STATUTORY_BONUS = "create-statutory-bonus";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${createRole}:${attribute.statutoryFieldsStatutoryBonus}`,
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  return {};
};

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<Response> => {
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: StatutoryBonusSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await createStatutoryBonus({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Statutory Bonus created successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to create Statutory Bonus",
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
};

export default function CreateStatutoryBonus({
  updateValues = null,
}: {
  updateValues?: StatutoryBonusDatabaseUpdate | null;
}) {
  const actionData = useActionData<typeof action>();

  const { companyId } = useCompanyId();

  const STATUTORY_BONUS_TAG = updateValues
    ? UPDATE_STATUTORY_BONUS
    : CREATE_STATUTORY_BONUS;

  const initialValues =
    updateValues ?? getInitialValueFromZod(StatutoryBonusSchema);

  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: STATUTORY_BONUS_TAG,
    constraint: getZodConstraint(StatutoryBonusSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: StatutoryBonusSchema });
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

    if (actionData.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.statutory_bonus);
      toast({
        title: "Success",
        description: actionData?.message || "Statutory Bonus created",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.message || "Failed to create Statutory Bonus",
        variant: "destructive",
      });
    }

    navigate("/payment-components/statutory-fields/statutory-bonus", {
      replace: true,
    });
  }, [actionData]);

  return (
    <section className="p-4 w-full">
      <Form method="POST" {...getFormProps(form)} className="flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl mb-6 capitalize">
              {replaceDash(STATUTORY_BONUS_TAG)}
            </CardTitle>
            <hr />
          </CardHeader>
          <CardContent>
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <div className="flex flex-col items-start justify-between gap-2">
              <SearchableSelectField
                key={resetKey}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  statutoryBonusPayFrequencyArray as unknown as string[],
                )}
                inputProps={{
                  ...getInputProps(fields.payment_frequency, { type: "text" }),
                }}
                placeholder="Select an option"
                labelProps={{
                  children: replaceUnderscore(fields.payment_frequency.name),
                }}
                errors={fields.payment_frequency.errors}
              />

              <Field
                inputProps={{
                  ...getInputProps(fields.percentage, { type: "number" }),
                  autoFocus: true,
                  placeholder: `Enter ${fields.percentage.name}`,
                }}
                labelProps={{
                  children: fields.percentage.name,
                }}
                errors={fields.percentage.errors}
              />
              <SearchableSelectField
                key={resetKey + 1}
                className="capitalize"
                options={payoutMonths}
                inputProps={{
                  disabled: form.value?.payment_frequency === "monthly",
                  ...getInputProps(fields.payout_month, { type: "text" }),
                }}
                placeholder="Select an option"
                labelProps={{
                  children: replaceUnderscore(fields.payout_month.name),
                }}
                errors={fields.payout_month.errors}
              />
            </div>
          </CardContent>
          <FormButtons form={form} setResetKey={setResetKey} isSingle={true} />
        </Card>
      </Form>
    </section>
  );
}

import {
  isGoodStatus,
  replaceUnderscore,
  getInitialValueFromZod,
  replaceDash,
  transformStringArrayIntoOptions,
  hasPermission,
  updateRole,
  ExitFormSchema,
  reasonForExitArray,
} from "@canny_ecosystem/utils";
import { Field, SearchableSelectField, TextareaField } from "@canny_ecosystem/ui/forms";
import { FormProvider, getFormProps, getInputProps, getTextareaProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, json, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@canny_ecosystem/ui/card";
import { createExit } from "@canny_ecosystem/supabase/mutations";
import type { ExitsRow } from "@canny_ecosystem/supabase/types";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { UPDATE_EXIT } from "./$exitId.update-exit";
import { clearCacheEntry } from "@/utils/cache";

export type ActionResponse = {
  status: number;
  error?: string;
};

export const CREATE_EXIT = "create-exit";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const employeeId = params.employeeId;

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.exits}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  return { employeeId };
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: ExitFormSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createExit({ supabase, data: submission.value as any });

    if (isGoodStatus(status)) return json({ status: "success", message: "Exit created", error: null });

    return json({ status: "error", message: "Exit creation failed", error }, { status: 500 });
  } catch (error) {
    return json({ status: "error", message: "An unexpected error occurred", error }, { status: 500 });
  }
}

export default function CreateExit({ updateValues }: { updateValues?: ExitsRow | null }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [resetKey, setResetKey] = useState(Date.now());

  const { employeeId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const EXIT_TAG = updateValues ? UPDATE_EXIT : CREATE_EXIT;

  const initialValues = updateValues ?? getInitialValueFromZod(ExitFormSchema);

  const [form, fields] = useForm({
    id: EXIT_TAG,
    constraint: getZodConstraint(ExitFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ExitFormSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      employee_id: employeeId
    } as any,
  });

  useEffect(() => {
    if (!actionData) return;
    clearCacheEntry(cacheKeyPrefix.exits);
    if (actionData?.status === "success") {
      toast({ title: "Success", description: actionData?.message, variant: "success" });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message || "Exit creation failed",
        variant: "destructive",
      });
    }
    navigate("/approvals/exits", { replace: true });
  }, [actionData]);

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl capitalize">{replaceDash(EXIT_TAG)}</CardTitle>
              <CardDescription>
                {EXIT_TAG.split("-")[0]} exit of a company that will be central in all of canny apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.employee_id, { type: "hidden" })} />
              <div className="flex gap-7">
                <Field
                  inputProps={{
                    ...getInputProps(fields.organization_payable_days, { type: "number" }),
                    className: "capitalize",
                    placeholder: `Enter ${replaceUnderscore(fields.organization_payable_days.name)}`,
                  }}
                  labelProps={{ children: replaceUnderscore(fields.organization_payable_days.name) }}
                  errors={fields.organization_payable_days.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.employee_payable_days, { type: "number" }),
                    className: "capitalize",
                    placeholder: `Enter ${replaceUnderscore(fields.employee_payable_days.name)}`,
                  }}
                  labelProps={{ children: replaceUnderscore(fields.employee_payable_days.name) }}
                  errors={fields.employee_payable_days.errors}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  inputProps={{
                    ...getInputProps(fields.bonus, { type: "number" }),
                    className: "capitalize",
                    placeholder: `Enter ${replaceUnderscore(fields.bonus.name)}`,
                  }}
                  labelProps={{ children: replaceUnderscore(fields.bonus.name) }}
                  errors={fields.bonus.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.leave_encashment, { type: "number" }),
                    className: "capitalize",
                    placeholder: `Enter ${replaceUnderscore(fields.leave_encashment.name)}`,
                  }}
                  labelProps={{ children: replaceUnderscore(fields.leave_encashment.name) }}
                  errors={fields.leave_encashment.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.gratuity, { type: "number" }),
                    className: "capitalize",
                    placeholder: `Enter ${replaceUnderscore(fields.gratuity.name)}`,
                  }}
                  labelProps={{ children: replaceUnderscore(fields.gratuity.name) }}
                  errors={fields.gratuity.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.deduction, { type: "number" }),
                    className: "capitalize",
                    placeholder: `Enter ${replaceUnderscore(fields.deduction.name)}`,
                  }}
                  labelProps={{ children: replaceUnderscore(fields.deduction.name) }}
                  errors={fields.deduction.errors}
                />
              </div>
              <div className="flex gap-7">
                <Field
                  inputProps={{
                    ...getInputProps(fields.last_working_day, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(fields.last_working_day.name)}`,
                  }}
                  labelProps={{ children: replaceUnderscore(fields.last_working_day.name) }}
                  errors={fields.last_working_day.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.final_settlement_date, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(fields.final_settlement_date.name)}`,
                  }}
                  labelProps={{ children: replaceUnderscore(fields.final_settlement_date.name) }}
                  errors={fields.final_settlement_date.errors}
                />
              </div>
              <SearchableSelectField
                className="w-full capitalize flex-1"
                key={resetKey}
                options={transformStringArrayIntoOptions(reasonForExitArray as unknown as string[])}
                inputProps={{ ...getInputProps(fields.reason, { type: "text" }) }}
                placeholder={`Select ${replaceUnderscore(fields.reason.name)}`}
                labelProps={{ children: replaceUnderscore(fields.reason.name) }}
                errors={fields.reason.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.note),
                  placeholder: `Enter ${replaceUnderscore(fields.note.name)}`,
                }}
                labelProps={{ children: replaceUnderscore(fields.note.name) }}
                errors={fields.note.errors}
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
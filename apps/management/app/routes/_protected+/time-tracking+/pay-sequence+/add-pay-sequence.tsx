import { FormButtons } from "@/components/form/form-buttons";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { createPaySequence } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PaySequenceDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { CheckboxField, Field } from "@canny_ecosystem/ui/forms";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  createRole,
  getInitialValueFromZod,
  hasPermission,
  isGoodStatus,
  replaceUnderscore,
  updateRole,
  PaySequenceSchema,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getSelectProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useRevalidator,
} from "@remix-run/react";
import { useEffect } from "react";
import { UPDATE_PAYSEQUENCE_TAG } from "./$id.update-pay-sequence";
import { WorkingDaysField } from "@/components/sites/pay-sequence/working-days-field";
import { useCompanyId } from "@/utils/company";

const ADD_PAYSEQUENCE_TAG = "add-paysequence";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.paySequence}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  return {};
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.paySequence}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: PaySequenceSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }
  const paySequenceData = submission.value;

  const { status, error } = await createPaySequence({
    supabase,
    data: paySequenceData,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Pay Sequence added successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Pay Sequence add failed",
    error,
  });
}

export default function AddPaySequence({
  updatableData,
}: {
  updatableData?: PaySequenceDatabaseUpdate | null;
}) {
  const revalidator = useRevalidator();
  const { companyId } = useCompanyId();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.paySequence}`);
        revalidator.revalidate();
        toast({
          title: "Success",
          description: actionData?.message || "Pay Sequence updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Pay Sequence update failed",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/pay-sequence");
    }
  }, [actionData]);

  const PAYSEQUENCE_TAG = updatableData
    ? UPDATE_PAYSEQUENCE_TAG
    : ADD_PAYSEQUENCE_TAG;

  const initialValues =
    updatableData ?? getInitialValueFromZod(PaySequenceSchema);

  const [form, fields] = useForm({
    id: PAYSEQUENCE_TAG,
    constraint: getZodConstraint(PaySequenceSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PaySequenceSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
    },
  });

  const onChange = () => {
    navigate("/time-tracking/pay-sequence");
  };

  return (
    <Dialog open={true} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {updatableData ? "Update" : "Add"} Pay Sequence
          </DialogTitle>
        </DialogHeader>
        <FormProvider context={form.context}>
          <Form method="POST" {...getFormProps(form)}>
            <input {...getInputProps(fields.company_id, { type: "hidden" })} />
            <Field
              className="w-full"
              inputProps={{
                ...getInputProps(fields.name, { type: "text" }),
                placeholder: "Name",
              }}
              labelProps={{
                children: replaceUnderscore(fields.name.name),
              }}
              errors={fields.name.errors}
            />
            <div className="grid grid-cols-2 place-content-center justify-between gap-x-8">
              <Field
                className="w-full"
                inputProps={{
                  ...getInputProps(fields.pay_day, { type: "number" }),
                  placeholder: "Pay Day",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.pay_day.name),
                }}
                errors={fields.pay_day.errors}
              />
              <Field
                className="w-full"
                inputProps={{
                  ...getInputProps(fields.overtime_multiplier, {
                    type: "number",
                  }),
                  placeholder: "Overtime Multiplier",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.overtime_multiplier.name),
                }}
                errors={fields.overtime_multiplier.errors}
              />
            </div>
            <CheckboxField
              buttonProps={getInputProps(fields.is_default, {
                type: "checkbox",
              })}
              labelProps={{
                htmlFor: fields.is_default.id,
                children: "Is Default?",
              }}
            />
            <WorkingDaysField
              labelProps={{ htmlFor: fields.working_days.id }}
              errors={fields.working_days.errors}
              selectProps={getSelectProps(fields.working_days) as any}
              className="flex flex-col items-start"
            />
          </Form>
        </FormProvider>

        <FormButtons className="mr-[-29px] pb-0" form={form} isSingle={true} />
      </DialogContent>
    </Dialog>
  );
}

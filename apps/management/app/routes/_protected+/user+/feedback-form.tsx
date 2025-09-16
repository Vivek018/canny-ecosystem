import { Form, json, useActionData, useNavigate } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import {
  categoryArray,
  FeedbackSchema,
  getInitialValueFromZod,
  isGoodStatus,
  severityArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { useState, useEffect } from "react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import { createFeedback } from "@canny_ecosystem/supabase/mutations";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useCompanyId } from "@/utils/company";
import { useUser } from "@/utils/user";
import { clearCacheEntry } from "@/utils/cache";

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: FeedbackSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createFeedback({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Feedback submitted successfully",
        error: null,
        returnTo: DEFAULT_ROUTE,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to submit feedback",
        error,
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 }
    );
  }
}

export default function FeedbackForm() {
  const actionData = useActionData<typeof action>();
  const { companyId } = useCompanyId();
  const { id: userId } = useUser();

  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "success") {
        clearCacheEntry(cacheKeyPrefix.feedback_list);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            actionData?.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData, navigate, toast]);

  const initialValues = getInitialValueFromZod(FeedbackSchema);
  const [form, fields] = useForm({
    id: "create-feedback",
    constraint: getZodConstraint(FeedbackSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: FeedbackSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      user_id: userId,
      company_id: companyId,
    },
  });

  return (
    <section className="flex flex-col gap-6 w-full lg:w-2/3 my-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
              <CardDescription>
                Please give your valuable suggestions/feedbacks here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.user_id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.subject, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${fields.subject.name}`,
                }}
                labelProps={{
                  children: fields.subject.name,
                }}
                errors={fields.subject.errors}
              />
              <div className="grid grid-cols-2 max-sm:grid-cols-1 place-content-center justify-between gap-6 max-sm:gap-2">
                <SearchableSelectField
                  key={resetKey}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    categoryArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.category, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.category.name}`}
                  labelProps={{
                    children: fields.category.name,
                  }}
                  errors={fields.category.errors}
                />
                <SearchableSelectField
                  key={resetKey + 1}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    severityArray as unknown as string[]
                  )}
                  inputProps={{
                    ...getInputProps(fields.severity, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.severity.name}`}
                  labelProps={{
                    children: fields.severity.name,
                  }}
                  errors={fields.severity.errors}
                />
              </div>
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.message),
                  placeholder: `Enter ${fields.message.name}`,
                }}
                labelProps={{ children: fields.message.name }}
                errors={fields.message.errors}
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

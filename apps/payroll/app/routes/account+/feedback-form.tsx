import { Form, json, useLoaderData,  } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getAuthUser } from "@canny_ecosystem/supabase/cached-queries";
import { getUserByEmail } from "@canny_ecosystem/supabase/queries";
import {
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import { Button } from "@canny_ecosystem/ui/button";
import { createFeedback } from "@canny_ecosystem/supabase/mutations";



export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { user } = await getAuthUser({ request });
  let userData = null;

  if (user?.email) {
    const { data } = await getUserByEmail({ supabase, email: user?.email });
    userData = data;
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  return json({ userId: userData?.id, companyId });
}

export async function action({ request }: ActionFunctionArgs) {
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
    return safeRedirect(DEFAULT_ROUTE);
  }
  return json({ status, error });
}

export default function Feedback() {
  const { userId, companyId } = useLoaderData<typeof loader>();

  const initialValues = getInitialValueFromZod(FeedbackSchema);

  const [resetKey, setResetKey] = useState(Date.now());

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
                  className: "capitalize",
                }}
                labelProps={{
                  children: fields.subject.name,
                }}
                errors={fields.subject.errors}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
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
            <CardFooter>
              <div className="ml-auto w-2/5 flex flex-row items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="full"
                  type="reset"
                  onClick={() => setResetKey(Date.now())}
                  {...form.reset.getButtonProps()}
                >
                  Reset
                </Button>
                <Button
                  form={form.id}
                  disabled={!form.valid}
                  variant="default"
                  size="full"
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </CardFooter>
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}

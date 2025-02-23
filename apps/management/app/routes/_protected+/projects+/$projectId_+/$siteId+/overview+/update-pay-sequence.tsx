import { FormButtons } from "@/components/form/form-buttons";
import { WorkingDaysField } from "@/components/sites/pay-sequence/working-days-field";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { updateSitePaySequence } from "@canny_ecosystem/supabase/mutations";
import { getSitePaySequenceInSite } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  getInitialValueFromZod,
  isGoodStatus,
  payFrequencyArray,
  replaceUnderscore,
  SitePaySequenceSchema,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getSelectProps,
  useForm,
} from "@conform-to/react";
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
  useParams,
} from "@remix-run/react";
import { useEffect, useState } from "react";

export const EDIT_PAY_SEQUENCE = "update-pay-sequence";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const siteId = params.siteId as string;
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { data } = await getSitePaySequenceInSite({ supabase, siteId });
    return json({ data, error: null });
  } catch (error) {
    return json({ data: null, error }, { status: 500 });
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const projectId = params.projectId;
  const siteId = params.siteId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: SitePaySequenceSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateSitePaySequence({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Pay sequence updated",
        error: null,
        returnTo: `/projects/${projectId}/${siteId}/overview`,
      });
    }
    return json(
      {
        status: "error",
        message: "Pay sequence update failed",
        error,
        returnTo: `/projects/${projectId}/${siteId}/overview`,
      },
      { status: 500 }
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
      returnTo: `/projects/${projectId}/${siteId}/overview`,
    });
  }
}

export default function EditPaySequence() {
  const { data } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { siteId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [resetKey, setResetKey] = useState(Date.now());
  const initialValues = data ?? getInitialValueFromZod(SitePaySequenceSchema);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.site_overview}${siteId}`);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);

  const [form, fields] = useForm({
    id: EDIT_PAY_SEQUENCE,
    constraint: getZodConstraint(SitePaySequenceSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SitePaySequenceSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: initialValues,
  });

  return (
    <section className='px-4 lg:px-10 xl:px-14 2xl:px-40 py-4'>
      <FormProvider context={form.context}>
        <Form
          method='POST'
          {...getFormProps(form)}
          className='flex flex-col h-full'
        >
          <Card>
            <CardHeader>
              <CardTitle className='text-3xl capitalize'>
                Update Pay Sequence
              </CardTitle>
              <CardDescription>
                Update Pay Sequence of a site that will be central in all of
                canny apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input {...getInputProps(fields.site_id, { type: "hidden" })} />
              <Field
                inputProps={{
                  ...getInputProps(fields.pay_day, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(
                    fields.pay_day.name
                  )}`,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.pay_day.name),
                }}
                errors={fields.pay_day.errors}
              />
              <SearchableSelectField
                key={resetKey}
                options={transformStringArrayIntoOptions(
                  payFrequencyArray as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fields.pay_frequency, { type: "text" }),
                }}
                placeholder={`Select ${replaceUnderscore(
                  fields.pay_frequency.name
                )}`}
                labelProps={{
                  children: replaceUnderscore(fields.pay_frequency.name),
                }}
                errors={fields.pay_frequency.errors}
              />
              <WorkingDaysField
                key={resetKey + 1}
                labelProps={{ htmlFor: fields.working_days.id }}
                errors={fields.working_days.errors}
                selectProps={getSelectProps(fields.working_days) as any}
                className='flex flex-col items-start'
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

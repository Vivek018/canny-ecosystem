import { FormButtons } from "@/components/form/form-buttons";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getPaymentTemplatesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PaymentTemplateAssignmentsDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import {
  eligibilityOptionsArray,
  getInitialValueFromZod,
  getValidDateForInput,
  isGoodStatus,
  positionArray,
  replaceUnderscore,
  SiteLinkSchema,
  skillLevelArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { createPaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import { UPDATE_SITE_TEMPLATE } from "./$templateAssignmentId+/update-site-template";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export const CREATE_SITE_TEMPLATE = "create-site-template";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data: paymentTemplatesData } = await getPaymentTemplatesByCompanyId(
      {
        supabase,
        companyId,
      },
    );

    const paymentTemplatesOptions =
      paymentTemplatesData?.map((template) => ({
        label: template.name,
        value: template.id ?? "",
      })) ?? [];

    return json({
      error: null,
      paymentTemplatesOptions,
    });
  } catch (error) {
    return json(
      {
        error,
        paymentTemplatesOptions: [],
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const projectId = params.projectId;
  const siteId = params.siteId;
  const returnTo = `/projects/${projectId}/${siteId}/link-templates`;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: SiteLinkSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await createPaymentTemplateAssignment({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Site created successfully",
        error: null,
        returnTo,
      });
    }
    return json(
      {
        status: "error",
        message: "Site creation failed",
        error,
        returnTo,
      },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo,
      },
      { status: 500 },
    );
  }
}

export default function CreateSiteTemplate({
  updateValues,
  updatePaymentTemplatesOptions,
}: {
  updateValues?: PaymentTemplateAssignmentsDatabaseUpdate | null;
  updatePaymentTemplatesOptions?: ComboboxSelectOption[] | null;
}) {
  const { paymentTemplatesOptions, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { siteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [resetKey, setResetKey] = useState(Date.now());
  const TEMPLATE_TAG = updateValues
    ? UPDATE_SITE_TEMPLATE
    : CREATE_SITE_TEMPLATE;

  const initialValues = updateValues ?? getInitialValueFromZod(SiteLinkSchema);

  const [form, fields] = useForm({
    id: TEMPLATE_TAG,
    constraint: getZodConstraint(SiteLinkSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SiteLinkSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      site_id: initialValues.site_id ?? siteId,
    },
  });

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.site_link_templates}${siteId}`);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error || actionData?.error?.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);

  if (error) {
    return (
      <ErrorBoundary error={error} message="Failed to create site template" />
    );
  }

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl capitalize">
                {TEMPLATE_TAG.split("-").join(" ")}
              </CardTitle>
              <CardDescription>
                Create a template for site payment configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input {...getInputProps(fields.site_id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.assignment_type, { type: "hidden" })}
              />
              <Field
                className="w-full"
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  placeholder: "Name",
                  defaultValue: fields.name.initialValue,
                }}
                labelProps={{ children: replaceUnderscore(fields.name.name) }}
                errors={fields.name.errors}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  className="w-full"
                  inputProps={{
                    ...getInputProps(fields.effective_from, { type: "date" }),
                    placeholder: replaceUnderscore(fields.effective_from.name),
                    max: getValidDateForInput(new Date().toISOString()),
                    defaultValue: getValidDateForInput(
                      fields.effective_from.initialValue as string,
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.effective_from.name),
                  }}
                  errors={fields.effective_from.errors}
                />
                <Field
                  className="w-full"
                  inputProps={{
                    ...getInputProps(fields.effective_to, { type: "date" }),
                    placeholder: replaceUnderscore(fields.effective_to.name),
                    min: getValidDateForInput(
                      fields.effective_from.value as string,
                    ),
                    defaultValue: getValidDateForInput(
                      fields.effective_to.initialValue as string,
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.effective_to.name),
                  }}
                  errors={fields.effective_to.errors}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SearchableSelectField
                  key={resetKey}
                  className="capitalize"
                  options={
                    updatePaymentTemplatesOptions ?? paymentTemplatesOptions
                  }
                  inputProps={{
                    ...getInputProps(fields.template_id, { type: "text" }),
                    defaultValue: fields.template_id.initialValue,
                  }}
                  placeholder="Select payment templates"
                  labelProps={{ children: "Payment templates" }}
                  errors={fields.template_id.errors}
                />
                <SearchableSelectField
                  key={resetKey + 1}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    eligibilityOptionsArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.eligibility_option, {
                      type: "text",
                    }),
                    defaultValue: fields.eligibility_option.initialValue,
                  }}
                  placeholder={`Select ${fields.eligibility_option.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.eligibility_option.name),
                  }}
                  errors={fields.eligibility_option.errors}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SearchableSelectField
                  key={resetKey + 2}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    positionArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.position, { type: "text" }),
                    defaultValue: fields.position.initialValue,
                    disabled: fields.eligibility_option.value !== "position",
                  }}
                  placeholder={`Select ${fields.position.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.position.name),
                  }}
                  errors={fields.position.errors}
                />
                <SearchableSelectField
                  key={resetKey + 3}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    skillLevelArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.skill_level, { type: "text" }),
                    defaultValue: fields.skill_level.initialValue,
                    disabled: fields.eligibility_option.value !== "skill_level",
                  }}
                  placeholder={`Select ${fields.skill_level.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.skill_level.name),
                  }}
                  errors={fields.skill_level.errors}
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

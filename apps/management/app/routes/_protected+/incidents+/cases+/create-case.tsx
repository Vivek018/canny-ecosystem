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
  getInitialValueFromZod,
  isGoodStatus,
  transformStringArrayIntoOptions,
  replaceUnderscore,
  createRole,
  hasPermission,
  CaseSchema,
  caseTypeArray,
  caseLocationTypeArray,
  reportedByArray,
  reportedOnArray,
  caseStatusArray,
} from "@canny_ecosystem/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import { createCase } from "@canny_ecosystem/supabase/mutations";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearCacheEntry } from "@/utils/cache";
import type { CasesDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { UPDATE_CASES_TAG } from "./$caseId.update-case";
import { useCompanyId } from "@/utils/company";

export const CREATE_CASES_TAG = "Create-Case";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${createRole}:${attribute.cases}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const caseId = params.caseId;

  return json({ caseId });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: CaseSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await createCase({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Case registered successfully",
        error: null,
        returnTo: "/incidents/cases",
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to register case",
        error,
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 },
    );
  }
}

export default function CreateCase({
  updateValues,
}: {
  updateValues?: CasesDatabaseUpdate | null;
}) {
  const actionData = useActionData<typeof action>();
  const { companyId } = useCompanyId();

  const [resetKey, setResetKey] = useState(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "success") {
        clearCacheEntry(cacheKeyPrefix.case);
        toast({
          title: "Success",
          description: actionData.message,
          variant: "success",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);

  const CASE_TAG = updateValues ? UPDATE_CASES_TAG : CREATE_CASES_TAG;

  const initialValues = updateValues ?? getInitialValueFromZod(CaseSchema);

  const [form, fields] = useForm({
    id: CASE_TAG,
    constraint: getZodConstraint(CaseSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CaseSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: companyId,
    },
  });

  return (
    <section className="flex flex-col w-full mx-auto lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>{updateValues ? "Update" : "Register"} Case</CardTitle>
              <CardDescription>
                {updateValues ? "Update" : "Register"} the Case here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <input
                {...getInputProps(fields.reported_by_id, { type: "hidden" })}
              />
              <input
                {...getInputProps(fields.reported_on_id, { type: "hidden" })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  inputProps={{
                    ...getInputProps(fields.date, { type: "date" }),
                    placeholder: `Enter ${fields.date.name}`,
                  }}
                  labelProps={{
                    children: fields.date.name,
                  }}
                  errors={fields.date.errors}
                />
                <SearchableSelectField
                  key={resetKey + 1}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    caseTypeArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.case_type, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.case_type.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.case_type.name),
                  }}
                  errors={fields.case_type.errors}
                />
              </div>
              <Field
                inputProps={{
                  ...getInputProps(fields.title, { type: "text" }),
                  placeholder: `Enter ${fields.title.name}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: fields.title.name,
                }}
                errors={fields.title.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.description),
                  placeholder: `Enter ${fields.description.name}`,
                  required: false,
                }}
                labelProps={{ children: fields.description.name }}
                errors={fields.description.errors}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    caseLocationTypeArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.location_type, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.location_type.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.location_type.name),
                  }}
                  errors={fields.location_type.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.location, { type: "text" }),
                    placeholder: `Enter ${fields.location.name}`,
                  }}
                  labelProps={{
                    children: fields.location.name,
                  }}
                  errors={fields.location.errors}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey + 1}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    reportedByArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.reported_by, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.reported_by.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.reported_by.name),
                  }}
                  errors={fields.reported_by.errors}
                />
                <SearchableSelectField
                  key={resetKey + 2}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    reportedOnArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.reported_on, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.reported_on.name}`}
                  labelProps={{
                    children: replaceUnderscore(fields.reported_on.name),
                  }}
                  errors={fields.reported_on.errors}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <SearchableSelectField
                  key={resetKey + 3}
                  className="capitalize"
                  options={transformStringArrayIntoOptions(
                    caseStatusArray as unknown as string[],
                  )}
                  inputProps={{
                    ...getInputProps(fields.status, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.status.name}`}
                  labelProps={{
                    children: fields.status.name,
                  }}
                  errors={fields.status.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.document, { type: "file" }),

                    placeholder: replaceUnderscore(
                      `Enter ${fields.document.name}`,
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.document.name),
                  }}
                  errors={fields.document.errors}
                />
              </div>
              <Field
                inputProps={{
                  ...getInputProps(fields.court_case_reference, {
                    type: "text",
                  }),
                  placeholder: replaceUnderscore(
                    `Enter ${fields.court_case_reference.name}`,
                  ),
                  required: false,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.court_case_reference.name),
                }}
                errors={fields.court_case_reference.errors}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  inputProps={{
                    ...getInputProps(fields.amount_given, { type: "number" }),
                    placeholder: `Enter ${replaceUnderscore(fields.amount_given.name)}`,
                    required: false,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.amount_given.name),
                  }}
                  errors={fields.amount_given.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.amount_received, {
                      type: "number",
                    }),
                    placeholder: `Enter ${replaceUnderscore(fields.amount_received.name)}`,
                    required: false,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.amount_received.name),
                  }}
                  errors={fields.amount_received.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.incident_date, { type: "date" }),
                    placeholder: `Enter ${fields.incident_date.name}`,
                    required: false,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.incident_date.name),
                  }}
                  errors={fields.incident_date.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.resolution_date, { type: "date" }),
                    placeholder: `Enter ${fields.resolution_date.name}`,
                    required: false,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.resolution_date.name),
                  }}
                  errors={fields.resolution_date.errors}
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

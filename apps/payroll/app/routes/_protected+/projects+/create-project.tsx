import {
  getValidDateForInput,
  hasPermission,
  isGoodStatus,
  ProjectSchema,
  statusArray,
  transformStringArrayIntoOptions,
  updateRole,
} from "@canny_ecosystem/utils";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import {
  getInitialValueFromZod,
  replaceDash,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { defer, json } from "@remix-run/node";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { createProject } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import type { ProjectDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { UPDATE_PROJECT } from "./$projectId+/update-project";
import { getCompanies } from "@canny_ecosystem/supabase/queries";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { Suspense, useEffect, useState } from "react";
import { FormButtons } from "@/components/form/form-buttons";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { CompanyListsWrapper } from "@/components/projects/company-lists-wrapper";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";

export const CREATE_PROJECT = "create-project";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(`${user?.role!}`, `${updateRole}:projects`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const companyOptionsPromise = getCompanies({ supabase }).then(
      ({ data, error }) => {
        if (data) {
          const companyOptions = data
            ?.filter((company) => company.id !== companyId)
            .map((company) => ({ label: company.name, value: company.id }));
          return { data: companyOptions, error };
        }
        return { data: null, error };
      }
    );

    return defer({
      error: null,
      companyId,
      companyOptionsPromise,
    });
  } catch (error) {
    return json(
      {
        error,
        companyId: null,
        companyOptionsPromise: null,
      },
      { status: 500 }
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
      schema: ProjectSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await createProject({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Project created",
        error: null,
      });
    }
    return json(
      { status: "error", message: "Project creation failed", error },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export default function CreateProject({
  updateValues,
  companyOptionsFromUpdate,
}: {
  updateValues?: ProjectDatabaseUpdate | null;
  companyOptionsFromUpdate?: ComboboxSelectOption[];
}) {
  const { companyId, companyOptionsPromise, error } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const PROJECT_TAG = updateValues ? UPDATE_PROJECT : CREATE_PROJECT;

  const initialValues = updateValues ?? getInitialValueFromZod(ProjectSchema);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: PROJECT_TAG,
    constraint: getZodConstraint(ProjectSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProjectSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      project_client_id: initialValues.project_client_id ?? companyId,
    },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Project creation failed",
          variant: "destructive",
        });
      }
      navigate("/projects", { replace: true });
    }
  }, [actionData]);

  if (error) {
    return <ErrorBoundary error={error} message="Failed to load projects" />;
  }

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(PROJECT_TAG)}
              </CardTitle>
              <CardDescription>
                {PROJECT_TAG.split("-")[0]} a project that will be central in
                all of canny apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.project_client_id, {
                  type: "hidden",
                })}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${fields.name.name}`,
                }}
                labelProps={{ children: fields.name.name }}
                errors={fields.name.errors}
              />
              <div className="grid grid-cols-3 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.project_code, {
                      type: "text",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.project_code.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.project_code.name),
                  }}
                  errors={fields.project_code.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.project_type, {
                      type: "text",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.project_type.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.project_type.name),
                  }}
                  errors={fields.project_type.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  inputProps={{
                    ...getInputProps(fields.status, {
                      type: "text",
                    }),
                    placeholder: `Select ${fields.status.name}`,
                  }}
                  options={transformStringArrayIntoOptions(
                    statusArray as unknown as string[]
                  )}
                  labelProps={{
                    children: fields.status.name,
                  }}
                  errors={fields.status.errors}
                />
              </div>
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.description),
                  placeholder: `Enter ${fields.description.name}`,
                }}
                labelProps={{ children: fields.description.name }}
                errors={fields.description.errors}
              />
              <Suspense fallback={<div>Loading...</div>}>
                <Await resolve={companyOptionsPromise}>
                  {(resolvedData) => {
                    if (!resolvedData)
                      return (
                        <ErrorBoundary message="Failed to load company options" />
                      );
                    return (
                      <CompanyListsWrapper
                        data={resolvedData.data}
                        error={resolvedData.error}
                        fields={fields}
                        resetKey={resetKey}
                        companyOptionsFromUpdate={companyOptionsFromUpdate}
                      />
                    );
                  }}
                </Await>
              </Suspense>
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.start_date, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.start_date.name
                    )}`,
                    max: getValidDateForInput(new Date().toISOString()),
                    defaultValue: getValidDateForInput(
                      fields.start_date.initialValue
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.start_date.name),
                  }}
                  errors={fields.start_date.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.estimated_end_date, {
                      type: "date",
                    }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.estimated_end_date.name
                    )}`,
                    min: getValidDateForInput(fields.start_date.value),
                    defaultValue: getValidDateForInput(
                      fields.estimated_end_date.initialValue
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.estimated_end_date.name),
                  }}
                  errors={fields.estimated_end_date.errors}
                />
              </div>
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.risk_assessment),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.risk_assessment.name
                  )}`,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.risk_assessment.name),
                }}
                errors={fields.risk_assessment.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.quality_standards),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.quality_standards.name
                  )}`,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.quality_standards.name),
                }}
                errors={fields.quality_standards.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.health_safety_requirements),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.health_safety_requirements.name
                  )}`,
                }}
                labelProps={{
                  children: replaceUnderscore(
                    fields.health_safety_requirements.name
                  ),
                }}
                errors={fields.health_safety_requirements.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.environmental_considerations),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.environmental_considerations.name
                  )}`,
                }}
                labelProps={{
                  children: replaceUnderscore(
                    fields.environmental_considerations.name
                  ),
                }}
                errors={fields.environmental_considerations.errors}
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

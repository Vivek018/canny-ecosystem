import {
  getValidDateForInput,
  isGoodStatus,
  ProjectSchema,
  statusArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
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
import { Form, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { safeRedirect } from "@/utils/server/http.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { createProject } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import type { ProjectDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { UPDATE_PROJECT } from "./$projectId.update-project";
import { getCompanies } from "@canny_ecosystem/supabase/queries";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { useState } from "react";

export const CREATE_PROJECT = "create-project";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: companies, error } = await getCompanies({ supabase });

  if (error) {
    throw error;
  }

  if (!companies) {
    throw new Error("No companies found");
  }

  const companyOptions = companies
    .filter((company) => company.id !== companyId)
    .map((company) => ({ label: company.name, value: company.id }));

  return json({ companyId, companyOptions });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: ProjectSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await createProject({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/projects");
  }
  return json({ status, error });
}

export default function CreateProject({
  updateValues,
  companyOptionsFromUpdate,
}: {
  updateValues?: ProjectDatabaseUpdate | null;
  companyOptionsFromUpdate?: ComboboxSelectOption[];
}) {
  const { companyId, companyOptions } = useLoaderData<typeof loader>();
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

  return (
    <section className="md:px-20 lg:px-52 2xl:px-80 py-6">
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
                {...getInputProps(fields.project_client_id, { type: "hidden" })}
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
                    ...getInputProps(fields.project_code, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(fields.project_code.name)}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.project_code.name),
                  }}
                  errors={fields.project_code.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.project_type, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(fields.project_type.name)}`,
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
                    statusArray as unknown as string[],
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
              <div className="grid grid-cols-2 place-content-center justify-between gap-16">
                <SearchableSelectField
                  key={resetKey + 1}
                  inputProps={{
                    ...getInputProps(fields.primary_contractor_id, {
                      type: "text",
                    }),
                    placeholder: "Select Primary Contractor",
                  }}
                  options={companyOptionsFromUpdate ?? companyOptions}
                  labelProps={{
                    children: "Primary Contactor",
                  }}
                  errors={fields.primary_contractor_id.errors}
                />
                <SearchableSelectField
                  key={resetKey + 2}
                  inputProps={{
                    ...getInputProps(fields.end_client_id, {
                      type: "text",
                    }),
                    placeholder: "Select End Client",
                  }}
                  options={companyOptionsFromUpdate ?? companyOptions}
                  labelProps={{
                    children: "End Client",
                  }}
                  errors={fields.end_client_id.errors}
                />
              </div>
              <div className="grid grid-cols-2 grid-rows-1 place-content-center justify-between gap-16">
                <Field
                  inputProps={{
                    ...getInputProps(fields.start_date, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(fields.start_date.name)}`,
                    max: getValidDateForInput(new Date().toISOString()),
                    defaultValue: getValidDateForInput(
                      fields.start_date.initialValue,
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
                    placeholder: `Enter ${replaceUnderscore(fields.estimated_end_date.name)}`,
                    min: getValidDateForInput(fields.start_date.value),
                    defaultValue: getValidDateForInput(
                      fields.estimated_end_date.initialValue,
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
                  placeholder: `Enter ${replaceUnderscore(fields.risk_assessment.name)}`,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.risk_assessment.name),
                }}
                errors={fields.risk_assessment.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.quality_standards),
                  placeholder: `Enter ${replaceUnderscore(fields.quality_standards.name)}`,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.quality_standards.name),
                }}
                errors={fields.quality_standards.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.health_safety_requirements),
                  placeholder: `Enter ${replaceUnderscore(fields.health_safety_requirements.name)}`,
                }}
                labelProps={{
                  children: replaceUnderscore(
                    fields.health_safety_requirements.name,
                  ),
                }}
                errors={fields.health_safety_requirements.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.environmental_considerations),
                  placeholder: `Enter ${replaceUnderscore(fields.environmental_considerations.name)}`,
                }}
                labelProps={{
                  children: replaceUnderscore(
                    fields.environmental_considerations.name,
                  ),
                }}
                errors={fields.environmental_considerations.errors}
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

import {
  getValidDateForInput,
  isGoodStatus,
  RelationshipSchema,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import {
  CheckboxField,
  Field,
  JSONBField,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import { getInitialValueFromZod, replaceDash } from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, json, useLoaderData } from "@remix-run/react";
import { Button } from "@canny_ecosystem/ui/button";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

import { UPDATE_RELATIONSHIP } from "./$relationshipId.update-relationship";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

import { createRelationship } from "@canny_ecosystem/supabase/mutations";
import type { RelationshipDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { getCompanies } from "@canny_ecosystem/supabase/queries";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export const CREATE_RELATIONSHIP = "create-relationship";

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
    schema: RelationshipSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await createRelationship({
    supabase,
    data: submission.value as any,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/settings/relationships", { status: 303 });
  }
  return json({ status, error });
}

export default function CreateRelationship({
  updateValues,
  companyOptionsFromUpdate,
}: {
  updateValues?: RelationshipDatabaseUpdate | null;
  companyOptionsFromUpdate?: ComboboxSelectOption[];
}) {
  const { companyId, companyOptions } = useLoaderData<typeof loader>();
  const RELATIONSHIP_TAG = updateValues
    ? UPDATE_RELATIONSHIP
    : CREATE_RELATIONSHIP;

  const initialValues =
    updateValues ?? getInitialValueFromZod(RelationshipSchema);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: RELATIONSHIP_TAG,
    constraint: getZodConstraint(RelationshipSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RelationshipSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      parent_company_id: initialValues.parent_company_id ?? companyId,
      terms: JSON.stringify(initialValues.terms),
    },
  });

  return (
    <section className="md:px-20 lg:px-52 2xl:px-80 py-6">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(RELATIONSHIP_TAG)}
              </CardTitle>
              <CardDescription>
                {RELATIONSHIP_TAG.split("-")[0]} relationship of a company that
                will be central in all of canny apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.parent_company_id, { type: "hidden" })}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.relationship_type, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(fields.relationship_type.name)}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.relationship_type.name),
                }}
                errors={fields.relationship_type.errors}
              />
              <SearchableSelectField
                key={resetKey}
                inputProps={{
                  ...getInputProps(fields.child_company_id, {
                    type: "text",
                  }),
                  placeholder: "Select Child Company",
                }}
                options={companyOptionsFromUpdate ?? companyOptions}
                labelProps={{
                  children: "Relationship With",
                }}
                errors={fields.child_company_id.errors}
              />
              <CheckboxField
                buttonProps={getInputProps(fields.is_active, {
                  type: "checkbox",
                })}
                labelProps={{
                  htmlFor: fields.is_active.id,
                  children: "Is this currently active?",
                }}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
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
                    ...getInputProps(fields.end_date, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(fields.end_date.name)}`,
                    min: getValidDateForInput(fields.start_date.value),
                    defaultValue: getValidDateForInput(
                      fields.end_date.initialValue,
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.end_date.name),
                  }}
                  errors={fields.end_date.errors}
                />
              </div>
              <JSONBField
                labelProps={{ children: "Relationship Terms" }}
                inputProps={{
                  ...getInputProps(fields.terms, { type: "hidden" }),
                }}
                errors={fields.terms.errors}
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

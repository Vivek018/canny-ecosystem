import {
  isGoodStatus,
  SiteSchema,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import {
  CheckboxField,
  Field,
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

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

import { createSite } from "@canny_ecosystem/supabase/mutations";
import type { SiteDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { statesAndUTs } from "@canny_ecosystem/utils/constant";
import { UPDATE_SITE } from "./$siteId.update-site";
import { getLocationsForSelectByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export const CREATE_SITE = "create-site";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: locations, error } = await getLocationsForSelectByCompanyId({
    supabase,
    companyId,
  });

  if (error) {
    throw error;
  }

  if (!locations) {
    throw new Error("No Locations Found");
  }

  const locationOptions = locations.map((location) => ({
    label: location.name,
    value: location.id,
  }));

  return json({ projectId, locationOptions });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const projectId = params.projectId;

  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: SiteSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await createSite({
    supabase,
    data: submission.value as any,
  });

  if (isGoodStatus(status)) {
    return safeRedirect(`/projects/${projectId}/sites`, { status: 303 });
  }
  return json({ status, error });
}

export default function CreateSite({
  updateValues,
  locationOptionsFromUpdate,
}: {
  updateValues?: SiteDatabaseUpdate | null;
  locationOptionsFromUpdate: ComboboxSelectOption[];
}) {
  const { projectId, locationOptions } = useLoaderData<typeof loader>();
  const SITE_TAG = updateValues ? UPDATE_SITE : CREATE_SITE;

  const initialValues = updateValues ?? getInitialValueFromZod(SiteSchema);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: SITE_TAG,
    constraint: getZodConstraint(SiteSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SiteSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      project_id: initialValues.project_id ?? projectId,
    },
  });

  return (
    <section className="md:px-20 lg:px-52 2xl:px-80 py-6">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(SITE_TAG)}
              </CardTitle>
              <CardDescription>
                {SITE_TAG.split("-")[0]} site of a project that will be central
                in all of canny apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.project_id, { type: "hidden" })}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(fields.name.name)}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.name.name),
                }}
                errors={fields.name.errors}
              />
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.site_code, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(fields.site_code.name)}`,
                    className: "capitalize",
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.site_code.name),
                  }}
                  errors={fields.site_code.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  className="capitalize"
                  options={locationOptionsFromUpdate ?? locationOptions}
                  inputProps={{
                    ...getInputProps(fields.company_location_id, {
                      type: "text",
                    }),
                  }}
                  placeholder={"Select Company Location"}
                  labelProps={{
                    children: "Company Location",
                  }}
                  errors={fields.company_location_id.errors}
                />
              </div>
              <CheckboxField
                buttonProps={getInputProps(fields.is_active, {
                  type: "checkbox",
                })}
                labelProps={{
                  htmlFor: fields.is_active.id,
                  children: "Is this site active?",
                }}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.address_line_1, { type: "text" }),
                  placeholder: replaceUnderscore(fields.address_line_1.name),
                  className: "placeholder:capitalize",
                }}
                labelProps={{
                  children: "Address",
                }}
                errors={fields.address_line_1.errors}
              />
              <Field
                className="-mt-4"
                inputProps={{
                  ...getInputProps(fields.address_line_2, { type: "text" }),
                  placeholder: replaceUnderscore(fields.address_line_2.name),
                  className: "placeholder:capitalize",
                }}
                errors={fields.address_line_2.errors}
              />
              <div className="grid grid-cols-3 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.city, { type: "text" }),
                    className: "capitalize",
                    placeholder: `Enter ${fields.city.name}`,
                  }}
                  labelProps={{
                    children: fields.city.name,
                  }}
                  errors={fields.city.errors}
                />
                <SearchableSelectField
                  key={resetKey}
                  className="capitalize"
                  options={statesAndUTs}
                  inputProps={{
                    ...getInputProps(fields.state, { type: "text" }),
                  }}
                  placeholder={`Select ${fields.state.name}`}
                  labelProps={{
                    children: fields.state.name,
                  }}
                  errors={fields.state.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.pincode, { type: "text" }),
                    className: "capitalize",
                    placeholder: `Enter ${replaceUnderscore(fields.pincode.name)}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.pincode.name),
                  }}
                  errors={fields.pincode.errors}
                />
              </div>
              <div className="grid grid-cols-2 place-content-center justify-between gap-6">
                <Field
                  inputProps={{
                    ...getInputProps(fields.latitude, { type: "number" }),
                    className: "capitalize",
                    placeholder: `Enter ${fields.latitude.name}`,
                  }}
                  labelProps={{
                    children: fields.latitude.name,
                  }}
                  errors={fields.latitude.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.longitude, { type: "number" }),
                    className: "capitalize",
                    placeholder: `Enter ${replaceUnderscore(fields.longitude.name)}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.longitude.name),
                  }}
                  errors={fields.longitude.errors}
                />
              </div>
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

import {
  isGoodStatus,
  LocationSchema,
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
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

import { UPDATE_LOCATION } from "./$locationId.update-location";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

import { createLocation } from "@canny_ecosystem/supabase/mutations";
import type { LocationDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { statesAndUTs } from "@canny_ecosystem/utils/constant";

export const CREATE_LOCATION = "create-location";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  return json({ companyId });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: LocationSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await createLocation({
    supabase,
    data: submission.value as any,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/settings/locations", { status: 303 });
  }
  return json({ status, error });
}

export default function CreateLocation({
  updateValues,
}: {
  updateValues?: LocationDatabaseUpdate | null;
}) {
  const { companyId } = useLoaderData<typeof loader>();
  const LOCATION_TAG = updateValues ? UPDATE_LOCATION : CREATE_LOCATION;

  const initialValues = updateValues ?? getInitialValueFromZod(LocationSchema);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: LOCATION_TAG,
    constraint: getZodConstraint(LocationSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LocationSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
    },
  });

  return (
    <section className="md:px-20 lg:px-52 2xl:px-80 py-6">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(LOCATION_TAG)}
              </CardTitle>
              <CardDescription>
                {LOCATION_TAG.split("-")[0]} location of a company that will be
                central in all of canny apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
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
              <CheckboxField
                buttonProps={getInputProps(fields.is_primary, {
                  type: "checkbox",
                })}
                labelProps={{
                  htmlFor: fields.is_primary.id,
                  children: "Is this your primary address?",
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
                className="-mt-6"
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

import {
  isGoodStatus,
  replaceUnderscore,
  zNumber,
  zString,
  zTextArea,
} from "@canny_ecosystem/utils";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import { Label } from "@canny_ecosystem/ui/label";
import { getInitialValueFromZod, replaceDash } from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, json, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { statesAndUTs } from "@canny_ecosystem/utils/constant";
import { Button } from "@canny_ecosystem/ui/button";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { createLocation } from "@canny_ecosystem/supabase/mutations";
import type { LocationDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { UPDATE_LOCATION } from "./$locationId.update-location";

export const CREATE_LOCATION = "create-location";

export const LocationSchema = z.object({
  id: z.string().optional(),
  name: zString.min(3),
  esic_code: zNumber.min(10).max(17),
  is_main: z.boolean().default(false),
  address: zTextArea,
  state: zString,
  city: zString.min(3),
  pin_code: zNumber.min(6).max(6),
  company_id: z.string().optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const companyId = await getCompanyIdOrFirstCompany(request, supabase);
  return json({ companyId: companyId });
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
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/locations", { status: 303 });
  }
  return json({ status, error });
}

export default function CreateLocation({
  updateValues,
}: { updateValues?: LocationDatabaseUpdate | null }) {
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
    defaultValue: initialValues,
  });

  return (
    <section className="px-60 py-12">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Label className="text-3xl mb-10">
            {replaceDash(LOCATION_TAG)}
          </Label>
          <input
            type="hidden"
            name={fields.id.name}
            value={fields.id.value ?? fields.id.initialValue}
          />
          <input
            type="hidden"
            name={fields.company_id.name}
            value={companyId}
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
          <div className="flex justify-between gap-16">
            <Field
              inputProps={{
                ...getInputProps(fields.esic_code, { type: "number" }),
                placeholder: `Enter ${replaceUnderscore(fields.esic_code.name)}`,
              }}
              labelProps={{
                children: replaceUnderscore(fields.esic_code.name),
              }}
              errors={fields.esic_code.errors}
            />
          </div>
          <CheckboxField
            buttonProps={getInputProps(fields.is_main, {
              type: "checkbox",
            })}
            labelProps={{
              htmlFor: fields.is_main.id,
              children: "Is this your main address?",
            }}
          />
          <TextareaField
            textareaProps={{
              ...getTextareaProps(fields.address),
              placeholder: `Enter ${replaceUnderscore(fields.address.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.address.name),
            }}
            errors={fields.address.errors}
          />
          <div className="-mt-4 grid grid-cols-3 grid-rows-1 place-content-center justify-between gap-6">
            <Field
              inputProps={{
                ...getInputProps(fields.city, { type: "text" }),
                autoFocus: true,
                className: "capitalize",
                placeholder: `Enter ${fields.city.name}`,
              }}
              labelProps={{
                children: "City",
              }}
              errors={fields.city.errors}
            />
            <SearchableSelectField
              key={resetKey}
              className="w-full capitalize flex-1"
              options={statesAndUTs}
              inputProps={{
                ...getInputProps(fields.state, { type: "text" }),
              }}
              placeholder={`Select ${fields.state.name}`}
              labelProps={{
                children: "State",
              }}
              errors={fields.state.errors}
            />
            <Field
              inputProps={{
                ...getInputProps(fields.pin_code, { type: "text" }),
                className: "capitalize",
                placeholder: `Enter ${replaceUnderscore(fields.pin_code.name)}`,
              }}
              labelProps={{
                children: "Pin Code",
              }}
              errors={fields.pin_code.errors}
            />
          </div>

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
        </Form>
      </FormProvider>
    </section>
  );
}

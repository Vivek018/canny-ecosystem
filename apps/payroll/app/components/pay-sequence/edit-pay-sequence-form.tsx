import type { SitePaySequenceDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import {
  getInitialValueFromZod,
  payFrequencyArray,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  SitePaySequenceSchema,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getSelectProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { WorkingDaysField } from "./working-days-field";

export const EDIT_PAY_SEQUENCE = "edit-pay-sequence";

export function EditPaySequenceForm({
  updateValues,
  projectId,
}: {
  updateValues: SitePaySequenceDatabaseUpdate;
  projectId: string;
}) {
  const PAY_SEQUENCE_TAG = EDIT_PAY_SEQUENCE;

  const initialValues =
    updateValues ?? getInitialValueFromZod(SitePaySequenceSchema);
  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: PAY_SEQUENCE_TAG,
    constraint: getZodConstraint(SitePaySequenceSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SitePaySequenceSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: initialValues,
  });

  return (
    <section className="p-2 h-full">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          {...getFormProps(form)}
          action={`/projects/${projectId}/sites/${fields.id.value ?? fields.id.initialValue}/edit-pay-sequence`}
          className="flex flex-col h-full"
        >
          <input {...getInputProps(fields.id, { type: "hidden" })} />
          <input {...getInputProps(fields.site_id, { type: "hidden" })} />
          <Field
            inputProps={{
              ...getInputProps(fields.pay_day, { type: "text" }),
              autoFocus: true,
              placeholder: `Enter ${replaceUnderscore(fields.pay_day.name)}`,
            }}
            labelProps={{ children: replaceUnderscore(fields.pay_day.name) }}
            errors={fields.pay_day.errors}
          />
          <SearchableSelectField
            key={resetKey}
            inputProps={{
              ...getInputProps(fields.pay_frequency, { type: "text" }),
            }}
            placeholder={`Select ${replaceUnderscore(fields.pay_frequency.name)}`}
            labelProps={{
              children: replaceUnderscore(fields.pay_frequency.name),
            }}
            options={transformStringArrayIntoOptions(
              payFrequencyArray as unknown as string[],
            )}
            errors={fields.pay_frequency.errors}
          />
          <WorkingDaysField
            key={resetKey + 1}
            labelProps={{ htmlFor: fields.working_days.id }}
            errors={fields.working_days.errors}
            selectProps={getSelectProps(fields.working_days) as any}
          />
          <div className="mt-auto mb-14 w-full flex gap-4">
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

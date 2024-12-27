import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { CheckboxField, Field, TextareaField } from "@canny_ecosystem/ui/forms";
import type { PaymentTemplateSchema } from "@canny_ecosystem/utils";
import {
  getInputProps,
  getTextareaProps,
  type FieldMetadata,
} from "@conform-to/react";
import { Fragment } from "react";

type FieldsType = {
  [K in keyof typeof PaymentTemplateSchema.shape]: FieldMetadata<
    typeof PaymentTemplateSchema,
    typeof PaymentTemplateSchema,
    string[]
  >;
};

export function CreatePaymentTemplateDetails({
  fields,
}: {
  fields: FieldsType;
}) {
  return (
    <Fragment>
      <CardHeader>
        <CardTitle className='text-3xl'>Create Payment Template</CardTitle>
        <CardDescription>
          Create a payment template that will be central in all of canny apps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input {...getInputProps(fields.company_id, { type: "hidden" })} />
        <Field
          inputProps={{
            ...getInputProps(fields.name, { type: "text" }),
            autoFocus: true,
            placeholder: `Enter ${fields.name.name}`,
          }}
          labelProps={{ children: fields.name.name }}
          errors={fields.name.errors}
        />
        <TextareaField
          textareaProps={{
            ...getTextareaProps(fields.description),
            placeholder: `Enter ${fields.description.name}`,
          }}
          labelProps={{ children: fields.description.name }}
          errors={fields.description.errors}
        />
        <div className='grid grid-cols-2 place-content-center justify-between gap-x-4'>
          <CheckboxField
            buttonProps={getInputProps(fields.is_active, {
              type: "checkbox",
            })}
            labelProps={{
              children: "Mark this as Active",
            }}
          />
          <CheckboxField
            buttonProps={getInputProps(fields.is_default, {
              type: "checkbox",
            })}
            labelProps={{
              children: "Mark this as Default",
            }}
          />
        </div>
      </CardContent>
    </Fragment>
  );
}

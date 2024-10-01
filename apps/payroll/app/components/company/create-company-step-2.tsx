import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Fragment } from "react";
import {
  replaceUnderscore,
  type CompanyRegistrationDetailsSchema,
} from "@canny_ecosystem/utils";
import { Field } from "@canny_ecosystem/ui/forms";
import { type FieldMetadata, getInputProps } from "@conform-to/react";
import type { CompanyRegistrationDetailsInsert } from "@canny_ecosystem/supabase/types";

type FieldsType = {
  [K in keyof typeof CompanyRegistrationDetailsSchema.shape]: FieldMetadata<
    CompanyRegistrationDetailsInsert,
    CompanyRegistrationDetailsInsert,
    string[]
  >;
};

export function CreateCompanyStep2({
  fields,
}: {
  fields: FieldsType;
}) {
  return (
    <Fragment>
      <CardHeader>
        <CardTitle className="text-3xl">
          Create Company Registration Details
        </CardTitle>
        <CardDescription>
          Add Company Registration details of the company
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-6">
        <Field
          className="col-span-2"
          inputProps={{
            ...getInputProps(fields.registration_number, { type: "text" }),
            placeholder: `Enter ${replaceUnderscore(fields.registration_number.name)}`,
          }}
          labelProps={{
            children: replaceUnderscore(fields.registration_number.name),
          }}
          errors={fields.registration_number.errors}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.gst_number, { type: "text" }),
            autoFocus: true,
            placeholder: `Enter ${replaceUnderscore(fields.gst_number.name)}`,
          }}
          labelProps={{ children: replaceUnderscore(fields.gst_number.name) }}
          errors={fields.gst_number.errors}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.pan_number, { type: "text" }),
            placeholder: `Enter ${replaceUnderscore(fields.pan_number.name)}`,
          }}
          labelProps={{ children: replaceUnderscore(fields.pan_number.name) }}
          errors={fields.pan_number.errors}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.pf_number, { type: "text" }),
            placeholder: `Enter ${replaceUnderscore(fields.pf_number.name)}`,
          }}
          labelProps={{
            children: replaceUnderscore(fields.pf_number.name),
          }}
          errors={fields.pf_number.errors}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.esi_number, { type: "text" }),
            placeholder: `Enter ${replaceUnderscore(fields.esi_number.name)}`,
          }}
          labelProps={{
            children: replaceUnderscore(fields.esi_number.name),
          }}
          errors={fields.esi_number.errors}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.lwf_number, { type: "text" }),
            placeholder: `Enter ${replaceUnderscore(fields.lwf_number.name)}`,
          }}
          labelProps={{
            children: replaceUnderscore(fields.lwf_number.name),
          }}
          errors={fields.lwf_number.errors}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.pt_number, { type: "text" }),
            placeholder: `Enter ${replaceUnderscore(fields.pt_number.name)}`,
          }}
          labelProps={{
            children: replaceUnderscore(fields.pt_number.name),
          }}
          errors={fields.pt_number.errors}
        />
      </CardContent>
    </Fragment>
  );
}

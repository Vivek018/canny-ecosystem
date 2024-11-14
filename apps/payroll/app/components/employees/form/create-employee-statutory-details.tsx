import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Fragment } from "react";
import {
  replaceUnderscore,
  type EmployeeStatutorySchema,
} from "@canny_ecosystem/utils";
import { Field } from "@canny_ecosystem/ui/forms";
import { type FieldMetadata, getInputProps } from "@conform-to/react";

type FieldsType = {
  [K in keyof typeof EmployeeStatutorySchema.shape]: FieldMetadata<
    typeof EmployeeStatutorySchema,
    typeof EmployeeStatutorySchema,
    string[]
  >;
};

export function CreateEmployeeStatutoryDetails({
  fields,
  isUpdate = false,
}: {
  fields: FieldsType;
  isUpdate?: boolean;
}) {
  return (
    <Fragment>
      <CardHeader>
        <CardTitle className="text-3xl">
          {isUpdate ? "Update" : "Add"} Employee Statutory Details
        </CardTitle>
        <CardDescription>
          {isUpdate ? "Update" : "Add"} all statutory details of the employee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input {...getInputProps(fields.employee_id, { type: "hidden" })} />
        <div className="grid grid-cols-3 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.aadhaar_number, { type: "text" }),
              autoFocus: true,
              placeholder: `Enter ${replaceUnderscore(fields.aadhaar_number.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.aadhaar_number.name),
            }}
            errors={fields.aadhaar_number.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.pan_number, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.pan_number.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.pan_number.name),
            }}
            errors={fields.pan_number.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.uan_number, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.uan_number.name)}`,
            }}
            labelProps={{ children: replaceUnderscore(fields.uan_number.name) }}
            errors={fields.uan_number.errors}
          />
        </div>
        <div className="grid grid-cols-2 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.pf_number, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.pf_number.name)}`,
            }}
            labelProps={{ children: replaceUnderscore(fields.pf_number.name) }}
            errors={fields.pf_number.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.esic_number, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.esic_number.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.esic_number.name),
            }}
            errors={fields.esic_number.errors}
          />
        </div>
        <div className="grid grid-cols-2 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.driving_license_number, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.driving_license_number.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.driving_license_number.name),
            }}
            errors={fields.driving_license_number.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.driving_license_expiry, { type: "date" }),
              placeholder: `Enter ${replaceUnderscore(fields.driving_license_expiry.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.driving_license_expiry.name),
            }}
            errors={fields.driving_license_expiry.errors}
          />
        </div>
        <div className="grid grid-cols-2 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.passport_number, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.passport_number.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.passport_number.name),
            }}
            errors={fields.passport_number.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.passport_expiry, { type: "date" }),
              placeholder: `Enter ${replaceUnderscore(fields.passport_expiry.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.passport_expiry.name),
            }}
            errors={fields.passport_expiry.errors}
          />
        </div>
      </CardContent>
    </Fragment>
  );
}

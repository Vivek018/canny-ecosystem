import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Fragment } from "react";
import {
  genderArray,
  getValidDateForInput,
  relationshipArray,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  type EmployeeGuardiansSchema,
} from "@canny_ecosystem/utils";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import { type FieldMetadata, getInputProps } from "@conform-to/react";

type FieldsType = {
  [K in keyof typeof EmployeeGuardiansSchema.shape]: FieldMetadata<
    (typeof EmployeeGuardiansSchema.shape)[K]["_type"],
    (typeof EmployeeGuardiansSchema.shape)[K],
    string[]
  >;
};

export function CreateEmployeeGuardianDetails({
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
          {isUpdate ? "Update" : "Add"} Employee Guardian
        </CardTitle>
        <CardDescription>
          {isUpdate ? "Update" : "Add"} guardian of the employee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input {...getInputProps(fields.id, { type: "hidden" })} />
        <input {...getInputProps(fields.employee_id, { type: "hidden" })} />
        <SearchableSelectField
          className="w-full capitalize flex-1"
          options={transformStringArrayIntoOptions(
            relationshipArray as unknown as string[],
          )}
          inputProps={{
            ...getInputProps(fields.relationship, { type: "text" }),
          }}
          placeholder={`Select ${fields.relationship.name}`}
          labelProps={{
            children: fields.relationship.name,
          }}
          errors={fields.relationship.errors}
        />
        <div className="grid grid-cols-2 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.first_name, { type: "text" }),
              autoFocus: true,
              placeholder: `Enter ${replaceUnderscore(fields.first_name.name)}`,
            }}
            labelProps={{ children: replaceUnderscore(fields.first_name.name) }}
            errors={fields.first_name.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.last_name, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.last_name.name)}`,
            }}
            labelProps={{ children: replaceUnderscore(fields.last_name.name) }}
            errors={fields.last_name.errors}
          />
        </div>
        <div className="grid grid-cols-2 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.date_of_birth, { type: "date" }),
              placeholder: `Enter ${replaceUnderscore(
                fields.date_of_birth.name,
              )}`,
              max: getValidDateForInput(new Date().toISOString()),
            }}
            labelProps={{
              children: replaceUnderscore(fields.date_of_birth.name),
            }}
            errors={fields.date_of_birth.errors}
          />
          <SearchableSelectField
            className="w-full capitalize flex-1"
            options={transformStringArrayIntoOptions(
              genderArray as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.gender, { type: "text" }),
            }}
            placeholder={`Select ${fields.gender.name}`}
            labelProps={{
              children: fields.gender.name,
            }}
            errors={fields.gender.errors}
          />
        </div>
        <CheckboxField
          buttonProps={getInputProps(fields.is_emergency_contact, {
            type: "checkbox",
          })}
          labelProps={{
            htmlFor: fields.is_emergency_contact.id,
            children: "Is it an emergency contact of the employee?",
          }}
        />
        <CheckboxField
          buttonProps={getInputProps(fields.address_same_as_employee, {
            type: "checkbox",
          })}
          labelProps={{
            htmlFor: fields.address_same_as_employee.id,
            children: "Is the address same as employee?",
          }}
        />
        <div className="grid grid-cols-3 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.mobile_number, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(
                fields.mobile_number.name,
              )}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.mobile_number.name),
            }}
            errors={fields.mobile_number.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.alternate_mobile_number, {
                type: "text",
              }),
              placeholder: `Enter ${replaceUnderscore(
                fields.alternate_mobile_number.name,
              )}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.alternate_mobile_number.name),
            }}
            errors={fields.alternate_mobile_number.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.email, {
                type: "text",
              }),
              placeholder: `Enter ${replaceUnderscore(fields.email.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.email.name),
            }}
            errors={fields.email.errors}
          />
        </div>
      </CardContent>
    </Fragment>
  );
}

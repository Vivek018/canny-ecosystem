import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Fragment } from "react";
import {
  educationArray,
  genderArray,
  getValidDateForInput,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  type EmployeeSchema,
} from "@canny_ecosystem/utils";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import { type FieldMetadata, getInputProps } from "@conform-to/react";

type FieldsType = {
  [K in keyof typeof EmployeeSchema.shape]: FieldMetadata<
    typeof EmployeeSchema,
    typeof EmployeeSchema,
    string[]
  >;
};

export function CreateEmployeeStep1({
  fields,
}: {
  fields: FieldsType;
}) {
  return (
    <Fragment>
      <CardHeader>
        <CardTitle className="text-3xl">Create Employee</CardTitle>
        <CardDescription>
          Create a employee that will be central in all of canny apps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input {...getInputProps(fields.company_id, { type: "hidden" })} />
        <div className="grid grid-cols-3 place-content-center justify-between gap-6">
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
              ...getInputProps(fields.middle_name, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.middle_name.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.middle_name.name),
            }}
            errors={fields.middle_name.errors}
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
              ...getInputProps(fields.employee_code, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.employee_code.name)}`,
            }}
            labelProps={{ children: replaceUnderscore(fields.employee_code.name) }}
            errors={fields.employee_code.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.photo, { type: "file" }),
              placeholder: `Enter ${fields.photo.name}`,
            }}
            labelProps={{ children: fields.photo.name }}
            errors={fields.photo.errors}
          />
        </div>
        <div className="grid grid-cols-3 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.date_of_birth, { type: "date" }),
              placeholder: `Enter ${replaceUnderscore(fields.date_of_birth.name)}`,
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
          <SearchableSelectField
            className="w-full capitalize flex-1"
            options={transformStringArrayIntoOptions(
              educationArray as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.education, { type: "text" }),
            }}
            placeholder={`Select ${fields.education.name}`}
            labelProps={{
              children: fields.education.name,
            }}
            errors={fields.education.errors}
          />
        </div>
        <CheckboxField
          buttonProps={getInputProps(fields.is_active, {
            type: "checkbox",
          })}
          labelProps={{
            htmlFor: fields.is_active.id,
            children: "Is this employee active?",
          }}
        />
        <div className="grid grid-cols-3 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.primary_mobile_number, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.primary_mobile_number.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.primary_mobile_number.name),
            }}
            errors={fields.primary_mobile_number.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.secondary_mobile_number, {
                type: "text",
              }),
              placeholder: `Enter ${replaceUnderscore(fields.secondary_mobile_number.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.secondary_mobile_number.name),
            }}
            errors={fields.secondary_mobile_number.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.personal_email, {
                type: "text",
              }),
              placeholder: `Enter ${replaceUnderscore(fields.personal_email.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.personal_email.name),
            }}
            errors={fields.personal_email.errors}
          />
        </div>
      </CardContent>
    </Fragment>
  );
}

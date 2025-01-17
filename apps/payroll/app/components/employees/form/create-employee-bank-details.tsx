import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Fragment } from "react";
import {
  accountTypeArray,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  type EmployeeBankDetailsSchema,
} from "@canny_ecosystem/utils";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { type FieldMetadata, getInputProps } from "@conform-to/react";

type FieldsType = {
  [K in keyof typeof EmployeeBankDetailsSchema.shape]: FieldMetadata<
    (typeof EmployeeBankDetailsSchema.shape)[K]["_type"],
    (typeof EmployeeBankDetailsSchema.shape)[K],
    string[]
  >;
};

export function CreateEmployeeBankDetails({
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
          {isUpdate ? "Update" : "Add"} Employee Bank Details
        </CardTitle>
        <CardDescription>
          {isUpdate ? "Update" : "Add"} bank details of the employee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input {...getInputProps(fields.employee_id, { type: "hidden" })} />
        <div className="grid grid-cols-2 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.account_number, { type: "text" }),
              autoFocus: true,
              placeholder: `Enter ${replaceUnderscore(fields.account_number.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.account_number.name),
            }}
            errors={fields.account_number.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.ifsc_code, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.ifsc_code.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.ifsc_code.name),
            }}
            errors={fields.ifsc_code.errors}
          />
        </div>
        <div className="grid grid-cols-2 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.account_holder_name, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.account_holder_name.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.account_holder_name.name),
            }}
            errors={fields.account_holder_name.errors}
          />
          <SearchableSelectField
            className="w-full capitalize flex-1"
            options={transformStringArrayIntoOptions(
              accountTypeArray as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.account_type, { type: "text" }),
            }}
            placeholder={`Select ${replaceUnderscore(fields.account_type.name)}`}
            labelProps={{
              children: replaceUnderscore(fields.account_type.name),
            }}
            errors={fields.account_type.errors}
          />
        </div>
        <div className="grid grid-cols-2 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.bank_name, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.bank_name.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.bank_name.name),
            }}
            errors={fields.bank_name.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.branch_name, { type: "text" }),
              placeholder: `Enter ${replaceUnderscore(fields.branch_name.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.branch_name.name),
            }}
            errors={fields.branch_name.errors}
          />
        </div>
      </CardContent>
    </Fragment>
  );
}

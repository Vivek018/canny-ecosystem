import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Fragment } from "react";
import {
  replaceUnderscore,
  type EmployeeAddressesSchema,
} from "@canny_ecosystem/utils";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import { type FieldMetadata, getInputProps } from "@conform-to/react";
import { statesAndUTs } from "@canny_ecosystem/utils/constant";

type FieldsType = {
  [K in keyof typeof EmployeeAddressesSchema.shape]: FieldMetadata<
    (typeof EmployeeAddressesSchema.shape)[K]["_type"],
    (typeof EmployeeAddressesSchema.shape)[K],
    string[]
  >;
};

export function CreateEmployeeAddress({
  fields,
  isUpdate = false,
}: {
  fields: FieldsType;
  isUpdate?: boolean;
}) {
  return (
    <Fragment>
      <CardHeader>
        <CardTitle className="text-3xl capitalize">
          {isUpdate ? "Update" : "Add"} Employee Address
        </CardTitle>
        <CardDescription>
          {isUpdate ? "Update" : "Add"} address of the employee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input {...getInputProps(fields.id, { type: "hidden" })} />
        <input {...getInputProps(fields.employee_id, { type: "hidden" })} />
        <Field
          inputProps={{
            ...getInputProps(fields.address_type, { type: "text" }),
            autoFocus: true,
            placeholder: `Enter ${replaceUnderscore(fields.address_type.name)}`,
          }}
          labelProps={{
            children: replaceUnderscore(fields.address_type.name),
          }}
          errors={fields.address_type.errors}
        />
        <CheckboxField
          buttonProps={getInputProps(fields.is_primary, {
            type: "checkbox",
          })}
          labelProps={{
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

              placeholder: `Enter ${fields.city.name}`,
            }}
            labelProps={{
              children: fields.city.name,
            }}
            errors={fields.city.errors}
          />
          <SearchableSelectField
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

              placeholder: `Enter ${replaceUnderscore(fields.longitude.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.longitude.name),
            }}
            errors={fields.longitude.errors}
          />
        </div>
      </CardContent>
    </Fragment>
  );
}

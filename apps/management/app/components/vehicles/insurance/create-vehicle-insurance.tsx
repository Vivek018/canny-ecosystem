import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Fragment } from "react";
import {
  replaceUnderscore,
  type VehiclesInsuranceSchema,
} from "@canny_ecosystem/utils";
import { Field } from "@canny_ecosystem/ui/forms";
import { type FieldMetadata, getInputProps } from "@conform-to/react";

type FieldsType = {
  [K in keyof typeof VehiclesInsuranceSchema.shape]: FieldMetadata<
    (typeof VehiclesInsuranceSchema.shape)[K]["_type"],
    (typeof VehiclesInsuranceSchema.shape)[K],
    string[]
  >;
};

export function CreateVehicleInsurance({
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
          {isUpdate ? "Update" : "Add"} Vehicle Insurance
        </CardTitle>
        <CardDescription>
          {isUpdate ? "Update" : "Add"} insurance of the vehicle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input {...getInputProps(fields.id, { type: "hidden" })} />
        <input {...getInputProps(fields.vehicle_id, { type: "hidden" })} />
        <Field
          inputProps={{
            ...getInputProps(fields.insurance_company, { type: "text" }),
            autoFocus: true,
            placeholder: `Enter ${replaceUnderscore(fields.insurance_company.name)}`,
          }}
          labelProps={{
            children: replaceUnderscore(fields.insurance_company.name),
          }}
          errors={fields.insurance_company.errors}
        />

        <Field
          inputProps={{
            ...getInputProps(fields.insurance_number, { type: "text" }),
            placeholder:
              replaceUnderscore(fields.insurance_number.name ?? "") || "",
            className: "placeholder:capitalize",
          }}
          labelProps={{
            children: replaceUnderscore(fields.insurance_number.name),
          }}
          errors={fields.insurance_number.errors}
        />
        <Field
          className="-mt-4"
          inputProps={{
            ...getInputProps(fields.insurance_yearly_amount, {
              type: "number",
            }),
            placeholder:
              replaceUnderscore(fields.insurance_yearly_amount.name) || "",

            className: "placeholder:capitalize",
          }}
          labelProps={{
            children: replaceUnderscore(fields.insurance_yearly_amount.name),
          }}
          errors={fields.insurance_yearly_amount.errors}
        />
        <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.start_date, { type: "date" }),
              className: "",
              placeholder: `Enter ${fields.start_date.name}`,
            }}
            labelProps={{
              children: fields.start_date.name,
            }}
            errors={fields.start_date.errors}
          />

          <Field
            inputProps={{
              ...getInputProps(fields.end_date, { type: "date" }),
              className: "",
              placeholder: `Enter ${replaceUnderscore(fields.end_date.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.end_date.name),
            }}
            errors={fields.end_date.errors}
          />
        </div>

        <Field
          inputProps={{
            ...getInputProps(fields.document, { type: "file" }),

            placeholder: `Enter ${replaceUnderscore(fields.document.name)}`,
          }}
          labelProps={{
            children: replaceUnderscore(fields.document.name),
          }}
          errors={fields.document.errors}
        />
      </CardContent>
    </Fragment>
  );
}

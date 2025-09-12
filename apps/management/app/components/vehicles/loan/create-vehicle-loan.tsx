import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Fragment } from "react";
import {
  replaceUnderscore,
  type VehiclesLoanSchema,
} from "@canny_ecosystem/utils";
import { Field } from "@canny_ecosystem/ui/forms";
import { type FieldMetadata, getInputProps } from "@conform-to/react";

type FieldsType = {
  [K in keyof typeof VehiclesLoanSchema.shape]: FieldMetadata<
    (typeof VehiclesLoanSchema.shape)[K]["_type"],
    (typeof VehiclesLoanSchema.shape)[K],
    string[]
  >;
};

export function CreateVehicleLoan({
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
          {isUpdate ? "Update" : "Add"} Vehicle Loan
        </CardTitle>
        <CardDescription>
          {isUpdate ? "Update" : "Add"} loan of the vehicle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input {...getInputProps(fields.vehicle_id, { type: "hidden" })} />
        <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.bank_name, { type: "text" }),
              autoFocus: true,
              placeholder: `Enter ${replaceUnderscore(fields.bank_name.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.bank_name.name),
            }}
            errors={fields.bank_name.errors}
          />

          <Field
            inputProps={{
              ...getInputProps(fields.period, { type: "text" }),
              placeholder: replaceUnderscore(fields.period.name ?? "") || "",
              className: "placeholder:capitalize",
            }}
            labelProps={{
              children: replaceUnderscore(fields.period.name),
            }}
            errors={fields.period.errors}
          />
        </div>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4 place-content-center justify-between gap-6">
          <Field
            className=""
            inputProps={{
              ...getInputProps(fields.amount, {
                type: "number",
              }),
              placeholder: replaceUnderscore(fields.amount.name) || "",

              className: "placeholder:capitalize",
            }}
            labelProps={{
              children: replaceUnderscore(fields.amount.name),
            }}
            errors={fields.amount.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.interest, { type: "number" }),

              placeholder: `Enter ${fields.interest.name}`,
            }}
            labelProps={{
              children: fields.interest.name,
            }}
            errors={fields.interest.errors}
          />
        </div>

        <Field
          inputProps={{
            ...getInputProps(fields.monthly_emi, { type: "number" }),

            placeholder: `Enter ${replaceUnderscore(fields.monthly_emi.name)}`,
          }}
          labelProps={{
            children: replaceUnderscore(fields.monthly_emi.name),
          }}
          errors={fields.monthly_emi.errors}
        />
        <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.start_date, { type: "date" }),
              className: "",
              placeholder: `Enter ${fields.start_date.name}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.start_date.name),
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

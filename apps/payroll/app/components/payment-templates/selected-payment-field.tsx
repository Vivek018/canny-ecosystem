import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  componentTypeArray,
  transformStringArrayIntoOptions,
  type PaymentTemplateComponentsSchema,
} from "@canny_ecosystem/utils";
import { type FieldMetadata, getInputProps } from "@conform-to/react";
import { Fragment, useState } from "react";

type FieldsType = {
  [K in keyof typeof PaymentTemplateComponentsSchema.shape.payment_template_components.element.shape]: FieldMetadata<
    (typeof PaymentTemplateComponentsSchema.shape.payment_template_components.element.shape)[K]["_type"],
    typeof PaymentTemplateComponentsSchema.shape.payment_template_components,
    string[]
  >;
};

export const SelectedPaymentField = ({
  field,
  monthlyCtc,
}: {
  field: FieldsType;
  monthlyCtc?: number;
}) => {
  const [disableValue] = useState(
    field.payment_field.getFieldset().payment_type.value === "fixed"
  );
  const [isPercentage] = useState(
    field.payment_field.getFieldset().calculation_type.value ===
      "percentage_of_ctc"
  );
  const errorClassName = "min-h-min pt-0 pb-0";

  return (
    <Fragment>
      <input
        {...getInputProps(field.payment_field_id, {
          type: "hidden",
        })}
      />

      <input
        {...getInputProps(field.target_type, { type: "hidden" })}
        defaultValue={field.target_type.value ?? "payment_field"}
      />
      <Field
        inputProps={{
          ...getInputProps(field.payment_field.getFieldset().name, {
            type: "text",
          }),
          disabled: true,
          className: "disabled:opacity-100",
        }}
        errorClassName={errorClassName}
      />
      <SearchableSelectField
        className='capitalize'
        options={transformStringArrayIntoOptions(
          componentTypeArray as unknown as string[]
        )}
        inputProps={{
          ...getInputProps(field.component_type, { type: "text" }),
        }}
        placeholder='Select Component Type'
        errors={field.component_type.errors}
        errorClassName={errorClassName}
      />
      <div className='flex items-center gap-1'>
        <Field
          inputProps={{
            ...getInputProps(field.calculation_value, {
              type: "number",
            }),
            className: "border-muted-foreground",
            placeholder: "Enter Calculation Value Per Month",
            min: 0,
            max: monthlyCtc ?? field.calculation_value.max,
            disabled: disableValue,
          }}
          errors={field.calculation_value.errors}
          errorClassName={errorClassName}
        />
        <p
          className={cn(
            "h-9 w-52 text-sm tracking-wide truncate hidden justify-center items-center bg-muted text-muted-foreground rounded",
            isPercentage && "flex"
          )}
        >
          {field.payment_field.getFieldset().amount.initialValue}% of CTC
        </p>
      </div>
    </Fragment>
  );
};

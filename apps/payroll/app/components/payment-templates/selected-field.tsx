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

const errorClassName = "min-h-min pt-0 pb-0";

export const SelectedPaymentField = ({
  field,
  monthlyCtc,
  disable,
  percentage,
}: {
  field: FieldsType;
  monthlyCtc?: number;
  disable?: boolean;
  percentage?: boolean;
}) => {
  const [disabled] = useState(
    disable ?? field.payment_field.getFieldset().payment_type.value === "fixed"
  );
  const [isPercentage] = useState(
    percentage ??
      field.payment_field.getFieldset().calculation_type.value ===
        "percentage_of_ctc"
  );

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
            disabled: disabled,
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

export const SelectedEPFField = ({
  field,
  value,
}: {
  field: FieldsType;
  value?: number;
}) => {
  return (
    <Fragment>
      <input
        {...getInputProps(field.epf_id, {
          type: "hidden",
        })}
      />

      <input
        {...getInputProps(field.target_type, { type: "hidden" })}
        defaultValue={field.target_type.value ?? "epf"}
      />
      <Field
        inputProps={{
          ...getInputProps(field.epf.getFieldset().epf_number, {
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
            max: value ?? field.calculation_value.max,
            disabled: true,
          }}
          errors={field.calculation_value.errors}
          errorClassName={errorClassName}
        />
        <p
          className={cn(
            "h-9 w-52 text-sm tracking-wide truncate flex justify-center items-center bg-muted text-muted-foreground rounded"
          )}
        >
          {Number.parseFloat(
            field.epf.getFieldset().employee_contribution.initialValue ?? "0"
          ) * 100}
          % of Earnings
        </p>
      </div>
    </Fragment>
  );
};

export const SelectedESIField = ({
  field,
  value,
}: {
  field: FieldsType;
  value?: number;
}) => {
  return (
    <Fragment>
      <input
        {...getInputProps(field.esi_id, {
          type: "hidden",
        })}
      />

      <input
        {...getInputProps(field.target_type, { type: "hidden" })}
        defaultValue={field.target_type.value ?? "esi"}
      />
      <Field
        inputProps={{
          ...getInputProps(field.esi.getFieldset().esi_number, {
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
            max: value,
            disabled: true,
          }}
          errors={field.calculation_value.errors}
          errorClassName={errorClassName}
        />
        <p
          className={cn(
            "h-9 w-52 text-sm tracking-wide truncate flex justify-center items-center bg-muted text-muted-foreground rounded"
          )}
        >
          {Number.parseFloat(
            field.esi.getFieldset().employees_contribution.initialValue ?? "0"
          ) * 100}
          % of Earnings
        </p>
      </div>
    </Fragment>
  );
};

export const SelectedPTField = ({
  field,
  value,
}: {
  field: FieldsType;
  value?: number;
}) => {
  return (
    <Fragment>
      <input
        {...getInputProps(field.pt_id, {
          type: "hidden",
        })}
      />

      <input
        {...getInputProps(field.target_type, { type: "hidden" })}
        defaultValue={field.target_type.value ?? "pt"}
      />
      <Field
        inputProps={{
          ...getInputProps(field.pt.getFieldset().pt_number, {
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
      <Field
        inputProps={{
          ...getInputProps(field.calculation_value, {
            type: "number",
          }),
          className: "border-muted-foreground",
          placeholder: "Enter Calculation Value Per Month",
          min: 0,
          max: value,
          disabled: true,
        }}
        errors={field.calculation_value.errors}
        errorClassName={errorClassName}
      />
    </Fragment>
  );
};

export const SelectedLWFField = ({
  field,
  value,
}: {
  field: FieldsType;
  value?: number;
}) => {
  return (
    <Fragment>
      <input
        {...getInputProps(field.lwf_id, {
          type: "hidden",
        })}
      />

      <input
        {...getInputProps(field.target_type, { type: "hidden" })}
        defaultValue={field.target_type.value ?? "lwf"}
      />
      <Field
        inputProps={{
          ...getInputProps(field.lwf.getFieldset().name, {
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
      <Field
        inputProps={{
          ...getInputProps(field.calculation_value, {
            type: "number",
          }),
          className: "border-muted-foreground",
          placeholder: "Enter Calculation Value Per Month",
          min: 0,
          max: value,
          disabled: true,
        }}
        errors={field.calculation_value.errors}
        errorClassName={errorClassName}
      />
    </Fragment>
  );
};

export const SelectedBonusField = ({
  field,
  value,
}: {
  field: FieldsType;
  value?: number;
}) => {
  return (
    <Fragment>
      <input
        {...getInputProps(field.bonus_id, {
          type: "hidden",
        })}
      />

      <input
        {...getInputProps(field.target_type, { type: "hidden" })}
        defaultValue={field.target_type.value ?? "bonus"}
      />
      <Field
        inputProps={{
          ...getInputProps(field.bonus.getFieldset().name, {
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
            max: value,
            disabled: true,
          }}
          errors={field.calculation_value.errors}
          errorClassName={errorClassName}
        />
        <p
          className={cn(
            "h-9 w-52 text-sm tracking-wide truncate flex justify-center items-center bg-muted text-muted-foreground rounded"
          )}
        >
          {Number.parseFloat(
            field.bonus.getFieldset().percentage.initialValue ?? "8.33"
          )}
          % of Basic
        </p>
      </div>
    </Fragment>
  );
};

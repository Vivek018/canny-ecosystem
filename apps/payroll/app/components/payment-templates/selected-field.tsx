import { usePaymentComponentsStore } from "@/store/payment-components";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  componentTypeArray,
  transformStringArrayIntoOptions,
  type PaymentTemplateComponentsSchema,
} from "@canny_ecosystem/utils";
import { type FieldMetadata, getInputProps } from "@conform-to/react";
import { Fragment, useEffect } from "react";

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
  fieldOptions: {
    fieldName,
    percentageAmount,
    disabled,
    considerForEPF,
    considerForESI,
  },
}: {
  field: FieldsType;
  fieldOptions: {
    fieldName: string;
    percentageAmount: number | null | undefined;
    disabled: boolean;
    considerForEPF: boolean | null | undefined;
    considerForESI: boolean | null | undefined;
  };
}) => {
  const fieldId =
    field.payment_field_id.value ?? field.payment_field_id.initialValue ?? "";
  const value = Number.parseFloat(
    field.calculation_value.value ?? field.calculation_value.initialValue ?? "0"
  );
  const componentType =
    field.component_type.value ?? field.component_type.initialValue ?? "";

  const {
    valueForEPF,
    valueForESI,
    grossValue,
    setValueForEPF,
    setValueForESI,
    setGrossValue,
    setBasicValue,
  } = usePaymentComponentsStore();

  useEffect(() => {
    if (considerForEPF) {
      setValueForEPF({
        ...valueForEPF,
        [fieldId]: value,
      });

      if (!value) {
        setValueForEPF({
          ...valueForEPF,
          [fieldId]: 0,
        });
      }
    }

    if (considerForESI) {
      setValueForESI({
        ...valueForESI,
        [fieldId]: value,
      });
    }

    if (componentType === "earning") {
      setGrossValue({
        ...grossValue,
        [fieldId]: value,
      });
    } else {
      setGrossValue({
        ...grossValue,
        [fieldId]: 0,
      });
    }

    if (fieldName === "basic") {
      setBasicValue(value);
    }

    return () => {
      if (considerForEPF) {
        setValueForEPF({
          ...valueForEPF,
          [fieldId]: 0,
        });
      }

      if (considerForESI) {
        setValueForESI({
          ...valueForESI,
          [fieldId]: 0,
        });
      }

      if (componentType === "earning") {
        setGrossValue({
          ...grossValue,
          [fieldId]: 0,
        });
      }

      if (fieldName === "basic") {
        setBasicValue(0);
      }
    };
  }, [fieldId, componentType, value]);

  return (
    <Fragment>
      <input
        {...getInputProps(field.payment_field_id, {
          type: "hidden",
        })}
      />

      <input {...getInputProps(field.target_type, { type: "hidden" })} />
      <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm  items-center shadow-sm'>
        {fieldName}
      </div>
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
            disabled: disabled,
          }}
          errors={field.calculation_value.errors}
          errorClassName={errorClassName}
        />
        <p
          className={cn(
            "h-9 w-52 text-sm tracking-wide truncate hidden justify-center items-center bg-muted text-muted-foreground rounded",
            percentageAmount && "flex"
          )}
        >
          {percentageAmount}% of CTC
        </p>
      </div>
    </Fragment>
  );
};

export const SelectedEPFField = ({
  field,
  epf: { epfName, percentageAmount },
}: {
  field: FieldsType;
  epf: {
    epfName: string;
    percentageAmount: number | null | undefined;
  };
}) => {
  return (
    <Fragment>
      <input
        {...getInputProps(field.epf_id, {
          type: "hidden",
        })}
      />
      <input {...getInputProps(field.target_type, { type: "hidden" })} />
      <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm  items-center shadow-sm'>
        {epfName}
      </div>
      <SearchableSelectField
        className='capitalize'
        options={transformStringArrayIntoOptions(
          componentTypeArray as unknown as string[]
        )}
        inputProps={{
          ...getInputProps(field.component_type, { type: "text" }),
          disabled: true,
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
          {(percentageAmount ?? 0) * 100}% of Earnings
        </p>
      </div>
    </Fragment>
  );
};

export const SelectedESIField = ({
  field,
  esi: { esiName, employeesContribution },
}: {
  field: FieldsType;
  esi: {
    esiName: string;
    employeesContribution: number | null | undefined;
  };
}) => {
  return (
    <Fragment>
      <input
        {...getInputProps(field.esi_id, {
          type: "hidden",
        })}
      />

      <input {...getInputProps(field.target_type, { type: "hidden" })} />
      <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm  items-center shadow-sm'>
        {esiName}
      </div>
      <SearchableSelectField
        className='capitalize'
        options={transformStringArrayIntoOptions(
          componentTypeArray as unknown as string[]
        )}
        inputProps={{
          ...getInputProps(field.component_type, { type: "text" }),
          disabled: true,
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
          {(employeesContribution ?? 0) * 100}% of Earnings
        </p>
      </div>
    </Fragment>
  );
};

export const SelectedPTField = ({
  field,
  pt: { ptName },
}: {
  field: FieldsType;
  pt: {
    ptName: string;
  };
}) => {
  return (
    <Fragment>
      <input
        {...getInputProps(field.pt_id, {
          type: "hidden",
        })}
      />

      <input {...getInputProps(field.target_type, { type: "hidden" })} />
      <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm  items-center shadow-sm'>
        {ptName}
      </div>
      <SearchableSelectField
        className='capitalize'
        options={transformStringArrayIntoOptions(
          componentTypeArray as unknown as string[]
        )}
        inputProps={{
          ...getInputProps(field.component_type, { type: "text" }),
          disabled: true,
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
  lwf: { lwfName },
}: {
  field: FieldsType;
  lwf: {
    lwfName: string;
  };
}) => {
  return (
    <Fragment>
      <input
        {...getInputProps(field.lwf_id, {
          type: "hidden",
        })}
      />

      <input {...getInputProps(field.target_type, { type: "hidden" })} />
      <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm  items-center shadow-sm'>
        {lwfName}
      </div>
      <SearchableSelectField
        className='capitalize'
        options={transformStringArrayIntoOptions(
          componentTypeArray as unknown as string[]
        )}
        inputProps={{
          ...getInputProps(field.component_type, { type: "text" }),
          disabled: true,
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
  bonus: { bonusName, bonusPercentage },
}: {
  field: FieldsType;
  bonus: {
    bonusName: string;
    bonusPercentage: number | null | undefined;
  };
}) => {
  return (
    <Fragment>
      <input
        {...getInputProps(field.bonus_id, {
          type: "hidden",
        })}
      />

      <input {...getInputProps(field.target_type, { type: "hidden" })} />
      <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm  items-center shadow-sm'>
        {bonusName}
      </div>
      <SearchableSelectField
        className='capitalize'
        options={transformStringArrayIntoOptions(
          componentTypeArray as unknown as string[]
        )}
        inputProps={{
          ...getInputProps(field.component_type, { type: "text" }),
          disabled: true,
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
          {bonusPercentage}% of Basic
        </p>
      </div>
    </Fragment>
  );
};

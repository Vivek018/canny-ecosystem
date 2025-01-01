import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import {
  componentTypeArray,
  replaceUnderscore,
  statutoryFieldsArray,
  transformStringArrayIntoOptions,
  type PaymentTemplateComponentsSchema,
} from "@canny_ecosystem/utils";
import { getInputProps, type FieldMetadata } from "@conform-to/react";
import { Fragment } from "react";
import { PaymentFieldsSelect } from "../payment-fields-select";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { usePaymentComponentsStore } from "@/store/payment-components";
import { statesAndUTs } from "@canny_ecosystem/utils/constant";
import { StatutoryFieldsSelect } from "../statutory-fields-select";

type FieldsType = {
  [K in keyof typeof PaymentTemplateComponentsSchema.shape]: FieldMetadata<
    (typeof PaymentTemplateComponentsSchema.shape)[K]["_type"],
    (typeof PaymentTemplateComponentsSchema.shape)[K],
    string[]
  >;
};

export function CreatePaymentTemplateComponentDetails({
  fields,
  paymentFieldOptions,
  env,
}: {
  fields: FieldsType;
  paymentFieldOptions: ComboboxSelectOption[];
  env: SupabaseEnv;
}) {
  const { selectedPaymentFields } = usePaymentComponentsStore();

  const paymentTemplateComponentsField =
    fields.payment_template_components.getFieldList();

  const targetTypeDefaultValue = (
    fields: { name: string; value: string | null | undefined }[]
  ) => {
    for (const field of fields) {
      if (field.value) {
        return field.name.replace("_id", "");
      }
    }
  };

  return (
    <Fragment>
      <CardHeader>
        <CardTitle className='text-3xl'>Create Payment Template</CardTitle>
        <CardDescription>
          Create a payment template that will be central in all of canny apps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 place-content-center justify-between gap-6'>
          <Field
            inputProps={{
              ...getInputProps(fields.monthly_ctc, { type: "number" }),
              placeholder: `Enter ${replaceUnderscore(
                fields.monthly_ctc.name
              )}`,
              autoFocus: true,
              min: 0,
              max: 100000000,
              maxLength: 9,
            }}
            labelProps={{ children: "Enter CTC per month" }}
            errors={fields.monthly_ctc.errors}
          />
          <SearchableSelectField
            className='capitalize'
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
        </div>
        <div className='grid grid-cols-2 place-content-center justify-between gap-6'>
          <PaymentFieldsSelect
            className='pb-8'
            options={paymentFieldOptions}
            env={env}
          />
          <StatutoryFieldsSelect
            className='pb-8'
            options={transformStringArrayIntoOptions(
              statutoryFieldsArray as unknown as string[]
            )}
            env={env}
            state={fields.state.value ?? ""}
          />
        </div>
        <div className='w-full grid grid-cols-3 gap-3 justify-between border-b py-2 font-semibold'>
          <p>Component Name</p>
          <p>Component Type</p>
          <p>Amount</p>
        </div>
        {paymentTemplateComponentsField.map((field, index) => {
          const fieldSet = field.getFieldset();

          const defaultTargetType = targetTypeDefaultValue([
            fieldSet.epf_id,
            fieldSet.esi_id,
            fieldSet.lwf_id,
            fieldSet.pt_id,
            fieldSet.bonus_id,
          ]);

          return (
            <div
              key={index.toString()}
              className='w-full grid grid-cols-3 gap-3 justify-between py-4'
            >
              <input {...getInputProps(fieldSet.id, { type: "hidden" })} />
              <input
                {...getInputProps(fieldSet.payment_field_id, {
                  type: "hidden",
                })}
              />
              <input {...getInputProps(fieldSet.epf_id, { type: "hidden" })} />
              <input {...getInputProps(fieldSet.esi_id, { type: "hidden" })} />
              <input {...getInputProps(fieldSet.lwf_id, { type: "hidden" })} />
              <input {...getInputProps(fieldSet.pt_id, { type: "hidden" })} />
              <input
                {...getInputProps(fieldSet.bonus_id, { type: "hidden" })}
              />

              <input
                {...getInputProps(fieldSet.target_type, { type: "hidden" })}
                defaultValue={fieldSet.target_type.value ?? defaultTargetType}
              />
              {defaultTargetType && (
                <Field
                  inputProps={{
                    ...getInputProps(defaultTargetType as any, {
                      type: "text",
                    }),
                    value:
                      fieldSet[
                        defaultTargetType as "payment_field"
                      ].getFieldset().name.value ??
                      fieldSet[
                        defaultTargetType as "payment_field"
                      ].getFieldset().name.initialValue,
                    disabled: true,
                  }}
                />
              )}
              <SearchableSelectField
                className='capitalize'
                options={transformStringArrayIntoOptions(
                  componentTypeArray as unknown as string[]
                )}
                inputProps={{
                  ...getInputProps(fieldSet.component_type, { type: "text" }),
                  defaultValue: selectedPaymentFields[0]?.calculation_type,
                }}
                placeholder={`Select ${fieldSet.component_type.name}`}
                labelProps={{
                  children: fieldSet.component_type.name,
                }}
                errors={fieldSet.component_type.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fieldSet.calculation_value, {
                    type: "number",
                  }),
                  placeholder: `Enter ${replaceUnderscore(
                    fieldSet.calculation_value.name
                  )}`,
                  min: 0,
                  max: 100000000,
                  maxLength: 9,
                }}
                errors={fieldSet.calculation_value.errors}
              />
            </div>
          );
        })}
      </CardContent>
    </Fragment>
  );
}

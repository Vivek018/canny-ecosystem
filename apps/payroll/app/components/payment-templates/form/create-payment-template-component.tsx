import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import {
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
  const { selectedPaymentFields, selectedStatutoryFields } = usePaymentComponentsStore();

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
            state={String(fields.state.value)}
          />
        </div>
        <div className="w-full grid grid-cols-4 gap-4 justify-between border-b py-2 font-medium">
          <p>Component Name</p>
          <p>Component Type</p>
          <p>Calculation Type</p>
          <p>Amount</p>
        </div>
      </CardContent>
    </Fragment>
  );
}

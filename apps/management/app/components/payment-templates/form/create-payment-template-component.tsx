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
import { Fragment, useEffect, useState } from "react";
import { PaymentFieldsSelect } from "../payment-fields-select";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { statesAndUTs } from "@canny_ecosystem/utils/constant";
import { StatutoryFieldsSelect } from "../statutory-fields-select";
import {
  SelectedBonusField,
  SelectedEPFField,
  SelectedESIField,
  SelectedLWFField,
  SelectedPaymentField,
  SelectedPTField,
} from "../selected-field";
import { usePaymentComponentsStore } from "@/store/payment-components";

type FieldsType = {
  [K in keyof typeof PaymentTemplateComponentsSchema.shape]: FieldMetadata<
    (typeof PaymentTemplateComponentsSchema.shape)[K]["_type"],
    (typeof PaymentTemplateComponentsSchema.shape)[K],
    string[]
  >;
};

export function CreatePaymentTemplateComponentDetails({
  resetKey,
  fields,
  paymentFieldOptions,
  env,
  isUpdate = false,
}: {
  resetKey?: number;
  fields: FieldsType;
  paymentFieldOptions: ComboboxSelectOption[];
  env: SupabaseEnv;
  isUpdate?: boolean;
}) {
  const [monthlyCtcAutoFocus, setMonthlyCtcAutoFocus] = useState(true);
  const paymentTemplateComponentsField =
    fields.payment_template_components.getFieldList();

  const [
    { paymentFieldDefaultValue, statutoryFieldDefaultValue },
    setSelectFieldDefaultValues,
  ] = useState<{
    paymentFieldDefaultValue: string[];
    statutoryFieldDefaultValue: string[];
  }>({
    paymentFieldDefaultValue: [],
    statutoryFieldDefaultValue: [],
  });

  const targetTypeDefaultValue = (
    fields: { name: string; value: string | null | undefined }[]
  ) => {
    for (const field of fields) {
      if (field.value) {
        return field.name.split(".").pop()?.replace("_id", "");
      }
    }
  };

  useEffect(() => {
    if (isUpdate) {
      const getFieldValues = (idKey: string, value: string) =>
        paymentTemplateComponentsField
          .filter(
            (field) =>
              (field.getFieldset() as Record<string, any>)[idKey]?.value
          )
          .map(() => value);

      const paymentFieldDefaultValue = paymentTemplateComponentsField
        .filter((field) => field.getFieldset().payment_field_id?.value)
        .map((field) => field.getFieldset().payment_field_id.value);

      const statutoryFieldDefaultValue = [
        ...getFieldValues("epf_id", "epf"),
        ...getFieldValues("esi_id", "esi"),
        ...getFieldValues("pt_id", "pt"),
        ...getFieldValues("lwf_id", "lwf"),
        ...getFieldValues("bonus_id", "bonus"),
      ];

      const mergeUniqueValues = (
        existingValues: string[],
        newValues: (string | undefined)[]
      ): string[] => [
        ...existingValues,
        ...newValues.filter(
          (val): val is string =>
            val !== undefined && !existingValues.includes(val)
        ),
      ];

      setSelectFieldDefaultValues((prev) => ({
        paymentFieldDefaultValue: mergeUniqueValues(
          prev.paymentFieldDefaultValue,
          paymentFieldDefaultValue
        ),
        statutoryFieldDefaultValue: mergeUniqueValues(
          prev.statutoryFieldDefaultValue,
          statutoryFieldDefaultValue
        ),
      }));
    }
  }, [resetKey]);

  const { selectedPaymentFields, selectedStatutoryFields } =
    usePaymentComponentsStore();

  return (
    <Fragment>
      <CardHeader>
        <CardTitle className="text-3xl capitalize">
          {isUpdate ? "Update" : "Create"} Payment Template
        </CardTitle>
        <CardDescription>
          {isUpdate ? "Update" : "Create"} a payment template that will be
          central in all of canny apps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 place-content-center justify-between gap-6">
          <input {...getInputProps(fields.id, { type: "hidden" })} />
          <Field
            inputProps={{
              ...getInputProps(fields.monthly_ctc, { type: "number" }),
              onFocus: () => setMonthlyCtcAutoFocus(true),
              onBlur: () => setMonthlyCtcAutoFocus(false),
              placeholder: `Enter ${replaceUnderscore(
                fields.monthly_ctc.name
              )}`,
              autoFocus: monthlyCtcAutoFocus,
            }}
            labelProps={{ children: "Enter CTC per month" }}
            errors={fields.monthly_ctc.errors}
          />
          <SearchableSelectField
            key={resetKey}
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
        </div>
        <div className="grid grid-cols-2 place-content-center justify-between gap-6 mb-4">
          <PaymentFieldsSelect
            key={resetKey && resetKey + 1}
            defaultValue={paymentFieldDefaultValue}
            options={paymentFieldOptions}
            env={env}
            disabled={!fields.state.value || !fields.monthly_ctc.value}
          />
          <StatutoryFieldsSelect
            key={resetKey && resetKey + 2}
            defaultValue={statutoryFieldDefaultValue}
            options={transformStringArrayIntoOptions(
              statutoryFieldsArray as unknown as string[]
            )}
            env={env}
            state={
              statesAndUTs
                .find((s) => s.value === fields.state.value)
                ?.label.toLocaleLowerCase() ?? ""
            }
            disabled={!fields.state.value || !fields.monthly_ctc.value}
          />
        </div>
        <div className="w-full grid grid-cols-3 gap-3 justify-between border-b py-2 font-semibold">
          <p>Component Name</p>
          <p>Component Type</p>
          <p>Amount</p>
        </div>
        <div className="flex flex-col items-center justify-center py-1">
          {paymentTemplateComponentsField.map((field) => {
            const fieldSet = field.getFieldset();

            const defaultTargetType = targetTypeDefaultValue([
              fieldSet.payment_field_id,
              fieldSet.epf_id,
              fieldSet.esi_id,
              fieldSet.lwf_id,
              fieldSet.pt_id,
              fieldSet.bonus_id,
            ]);

            const paymentField = selectedPaymentFields?.find(
              (paymentField) =>
                paymentField.id ===
                (fieldSet.payment_field_id.value ??
                  fieldSet.payment_field_id.initialValue)
            );

            if (defaultTargetType) {
              return (
                <div
                  key={
                    (fieldSet as any)[`${defaultTargetType}_id`].value +
                    fieldSet.id.value +
                    resetKey
                  }
                  className="w-full grid grid-cols-3 gap-3 justify-between items-center"
                >
                  <input {...getInputProps(fieldSet.id, { type: "hidden" })} />
                  <input
                    {...getInputProps(fieldSet.template_id, { type: "hidden" })}
                  />

                  {defaultTargetType === "payment_field" && (
                    <SelectedPaymentField
                      field={fieldSet}
                      fieldOptions={{
                        fieldName: paymentField?.name ?? "",
                        percentageAmount:
                          paymentField?.calculation_type === "percentage_of_ctc"
                            ? paymentField?.amount
                            : null,
                        readOnly: paymentField?.payment_type === "fixed",
                        considerForEPF: paymentField?.consider_for_epf,
                        considerForESI: paymentField?.consider_for_esic,
                      }}
                    />
                  )}
                  {defaultTargetType === "epf" && (
                    <SelectedEPFField
                      field={fieldSet}
                      epf={{
                        epfName: "Provident Fund",
                        percentageAmount:
                          selectedStatutoryFields.epf?.employee_contribution,
                      }}
                    />
                  )}
                  {defaultTargetType === "esi" && (
                    <SelectedESIField
                      field={fieldSet}
                      esi={{
                        esiName: "Employee State Insurance",
                        employeesContribution:
                          selectedStatutoryFields.esi?.employee_contribution,
                      }}
                    />
                  )}
                  {defaultTargetType === "pt" && (
                    <SelectedPTField
                      field={fieldSet}
                      pt={{
                        ptName: "Professional Tax",
                      }}
                    />
                  )}
                  {defaultTargetType === "lwf" && (
                    <SelectedLWFField
                      field={fieldSet}
                      lwf={{
                        lwfName: "Labour Welfare Fund",
                      }}
                    />
                  )}
                  {defaultTargetType === "bonus" && (
                    <SelectedBonusField
                      field={fieldSet}
                      bonus={{
                        bonusName: "Bonus",
                        bonusPercentage:
                          selectedStatutoryFields.bonus?.percentage,
                      }}
                    />
                  )}
                </div>
              );
            }
          })}
        </div>
      </CardContent>
    </Fragment>
  );
}

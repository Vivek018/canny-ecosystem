import type { PaymentFieldDataType } from "@canny_ecosystem/supabase/queries";
import { componentTypeArray } from "@canny_ecosystem/utils";

export function getSelectedComponentFromField<T extends PaymentFieldDataType>({
  field,
  monthlyCtc,
}: { field: T; monthlyCtc: number }) {
  let calculationValue = null;

  if (field.payment_type === "fixed") {
    if (field.calculation_type === "fixed" && field.amount) {
      calculationValue = field.amount ?? 0;
    }
    if (field.calculation_type === "percentage_of_ctc" && monthlyCtc) {
      calculationValue = (monthlyCtc * (field.amount ?? 0)) / 100;
    }
  } else if (field.payment_type === "variable") {
    if (field.calculation_type === "fixed") {
      calculationValue = field.amount ?? 0;
    }
  }

  return {
    payment_field_id: field.id,
    payment_field: {
      name: field.name,
      calculation_type: field.calculation_type,
      payment_type: field.payment_type,
      amount: field.amount,
    },
    component_type: componentTypeArray[0],
    calculation_value: calculationValue ?? field.amount,
  };
}

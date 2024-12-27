import { type FC, useState } from "react";
import { MultiSelectCombobox } from "@canny_ecosystem/ui/multi-select-combobox";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import {
  getPaymentFieldById,
  type PaymentFieldDataType,
} from "@canny_ecosystem/supabase/queries";
import { usePaymentComponentsStore } from "@/store/payment-components";

interface PaymentFieldsSelectProps {
  className?: string;
  options: ComboboxSelectOption[];
  env: SupabaseEnv;
}

export const PaymentFieldsSelect: FC<PaymentFieldsSelectProps> = ({
  className,
  options,
  env,
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const { setSelectedPaymentFields } = usePaymentComponentsStore();
  const { supabase } = useSupabase({ env });

  const handleFieldChange = async (newSelectedFields: string[]) => {
    setSelectedFields(newSelectedFields);

    if (newSelectedFields.length > 0) {
      const selectedFieldsData = await Promise.all(
        newSelectedFields.map(async (id) => {
          const { data } = await getPaymentFieldById({ supabase, id });
          return data;
        })
      );

      // Filter out any null values and set the data
      setSelectedPaymentFields(
        selectedFieldsData.filter(
          (data): data is PaymentFieldDataType => data !== null
        )
      );
    } else {
      // If no fields are selected, set an empty array
      setSelectedPaymentFields([]);
    }
  };

  const handleRenderSelectedItem = (values: string[]): string => {
    if (values.length === 0) return "";

    if (values.length <= 6) {
      return options
        .reduce<string[]>((accumulator, option) => {
          if (values.includes(String(option.value))) {
            accumulator.push(option.label);
          }
          return accumulator;
        }, [])
        .join(", ");
    }

    return `${values.length} selected`;
  };

  return (
    <div className={className}>
      <MultiSelectCombobox
        label='Payment Field'
        options={options}
        value={selectedFields}
        onChange={handleFieldChange}
        renderItem={(option) => (
          <div
            role='option'
            aria-selected={selectedFields.includes(String(option.value))}
          >
            {option.label}
          </div>
        )}
        renderSelectedItem={handleRenderSelectedItem}
        aria-label='Filter by payment field'
        aria-required='false'
        aria-multiselectable='true'
        aria-describedby='payment-field-description'
      />
      <span id='payment-field-description' className='sr-only'>
        Select one or more payment fields. Shows individual payment fields names
        when 6 or fewer are selected.
      </span>
    </div>
  );
};

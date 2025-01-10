import { type FC, useEffect, useState } from "react";
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
  defaultValue?: string[];
  className?: string;
  options: ComboboxSelectOption[];
  env: SupabaseEnv;
  disabled?: boolean;
}

export const PaymentFieldsSelect: FC<PaymentFieldsSelectProps> = ({
  defaultValue,
  className,
  options,
  env,
  disabled,
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(
    defaultValue ?? []
  );
  const { setSelectedPaymentFields } = usePaymentComponentsStore();
  const { supabase } = useSupabase({ env });

  const fetchData = async (selectedFields: string[]) => {
    if (selectedFields.length > 0) {
      const selectedFieldsData = await Promise.all(
        selectedFields.map(async (id) => {
          const { data } = await getPaymentFieldById({ supabase, id });
          return data;
        })
      );

      setSelectedPaymentFields(
        selectedFieldsData.filter(
          (data): data is PaymentFieldDataType => data !== null
        )
      );
    } else {
      setSelectedPaymentFields([]);
    }
  };

  const handleFieldChange = (newSelectedFields: string[]) => {
    setSelectedFields(newSelectedFields);
  };

  useEffect(() => {
    setSelectedFields(defaultValue ?? []);
  }, [defaultValue]);

  useEffect(() => {
    fetchData(selectedFields);
  }, [selectedFields]);

  const handleRenderSelectedItem = (values: string[]): string => {
    if (values.length === 0) return "";

    if (values.length <= 3) {
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
        disabled={disabled}
        aria-label='Filter by payment field'
        aria-required='false'
        aria-multiselectable='true'
        aria-describedby='payment-field-description'
      />
      <span id='payment-field-description' className='sr-only'>
        Select one or more payment fields. Shows individual payment fields names
        when 3 or fewer are selected.
      </span>
    </div>
  );
};

import { type FC, useEffect, useState } from "react";
import { MultiSelectCombobox } from "@canny_ecosystem/ui/multi-select-combobox";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { usePaymentComponentsStore } from "@/store/payment-components";
import { useCompanyId } from "@/utils/company";
import {
  getEmployeeProvidentFundByCompanyId,
  getEmployeeStateInsuranceByCompanyId,
  getLabourWelfareFundByStateAndCompanyId,
  getProfessionalTaxByStateAndCompanyId,
  getStatutoryBonusByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { statutoryFieldsArray } from "@canny_ecosystem/utils";

interface StatutoryFieldsSelectProps {
  defaultValue?: string[];
  className?: string;
  options: ComboboxSelectOption[];
  env: SupabaseEnv;
  state: string;
  disabled?: boolean;
}

export const StatutoryFieldsSelect: FC<StatutoryFieldsSelectProps> = ({
  defaultValue,
  className,
  options,
  env,
  state,
  disabled,
}) => {
  const { companyId } = useCompanyId();
  const [selectedFields, setSelectedFields] = useState<string[]>(
    defaultValue ?? [],
  );
  const { selectedStatutoryFields, setSelectedStatutoryFields } =
    usePaymentComponentsStore();
  const { supabase } = useSupabase({ env });

  const fetchStatutoryFieldData = async (selectedFields: string[]) => {
    if (!companyId?.length) return;

    const fetchFunctions = {
      epf: () => getEmployeeProvidentFundByCompanyId({ supabase, companyId }),
      esi: () => getEmployeeStateInsuranceByCompanyId({ supabase, companyId }),
      bonus: () => getStatutoryBonusByCompanyId({ supabase, companyId }),
      pt: () =>
        getProfessionalTaxByStateAndCompanyId({ supabase, state, companyId }),
      lwf: () =>
        getLabourWelfareFundByStateAndCompanyId({ supabase, state, companyId }),
    };

    // Initialize updates object with null values for all fields
    const updates = statutoryFieldsArray.reduce(
      (acc, field) => {
        acc[field] = null;
        return acc;
      },
      {} as Record<string, any>,
    );

    // Fetch data for selected fields
    await Promise.all(
      selectedFields.map(async (field) => {
        const fetchFunction =
          fetchFunctions[field as keyof typeof fetchFunctions];
        if (fetchFunction) {
          const { data } = await fetchFunction();
          updates[field] = data;
        }
      }),
    );

    setSelectedStatutoryFields({
      ...selectedStatutoryFields,
      ...updates,
    });
  };

  const handleFieldChange = (newSelectedFields: string[]) => {
    setSelectedFields(newSelectedFields);
  };

  useEffect(() => {
    setSelectedFields(defaultValue ?? []);
  }, [defaultValue]);

  useEffect(() => {
    fetchStatutoryFieldData(selectedFields);
  }, [selectedFields, state]);

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
        label="Statutory Fields"
        options={options}
        value={selectedFields}
        onChange={handleFieldChange}
        renderItem={(option) => (
          <div
            role="option"
            aria-selected={selectedFields.includes(String(option.value))}
          >
            {option.label}
          </div>
        )}
        renderSelectedItem={handleRenderSelectedItem}
        disabled={disabled}
        aria-label="Filter by statutory field"
        aria-required="false"
        aria-multiselectable="true"
        aria-describedby="statutory-field-description"
      />
      <span id="statutory-field-description" className="sr-only">
        Select one or more statutory fields. Shows individual statutory names
        when 6 or fewer are selected.
      </span>
    </div>
  );
};

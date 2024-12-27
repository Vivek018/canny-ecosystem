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
  className?: string;
  options: ComboboxSelectOption[];
  env: SupabaseEnv;
  state: string;
}

export const StatutoryFieldsSelect: FC<StatutoryFieldsSelectProps> = ({
  className,
  options,
  env,
  state,
}) => {
  const { companyId } = useCompanyId();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const { selectedStatutoryFields, setSelectedStatutoryFields } =
    usePaymentComponentsStore();
  const { supabase } = useSupabase({ env });

  const getSelectedStatutoryField = async (
    statutoryFieldName: (typeof statutoryFieldsArray)[number]
  ) => {
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

    const fetchFunction = fetchFunctions[statutoryFieldName];
    if (fetchFunction) {
      const { data } = await fetchFunction();
      return data;
    }
    return null;
  };

  const handleFieldChange = async (newSelectedFields: string[]) => {
    // Find newly selected fields
    const newlySelected = newSelectedFields.filter(
      (field) => !selectedFields.includes(field)
    );

    // Find deselected fields
    const deselected = selectedFields.filter(
      (field) => !newSelectedFields.includes(field)
    );

    // Update selected fields state
    setSelectedFields(newSelectedFields);

    // Handle newly selected fields
    for (const field of newlySelected) {
      const data = await getSelectedStatutoryField(
        field as (typeof statutoryFieldsArray)[number]
      );
      setSelectedStatutoryFields({
        ...selectedStatutoryFields,
        [field]: data,
      });
    }

    // Handle deselected fields
    for (const field of deselected) {
      setSelectedStatutoryFields({
        ...selectedStatutoryFields,
        [field]: null,
      });
    }
  };

  useEffect(() => {
    const updates = statutoryFieldsArray.reduce((acc, field) => {
      if (!selectedFields.includes(field)) {
        acc[field] = null;
      }
      return acc;
    }, {} as Record<string, null>);

    setSelectedStatutoryFields({
      ...selectedStatutoryFields,
      ...updates,
    });
  }, []);

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
        label='Statutory Fields'
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
        aria-label='Filter by statutory field'
        aria-required='false'
        aria-multiselectable='true'
        aria-describedby='statutory-field-description'
      />
      <span id='statutory-field-description' className='sr-only'>
        Select one or more statutory fields. Shows individual statutory names
        when 6 or fewer are selected.
      </span>
    </div>
  );
};

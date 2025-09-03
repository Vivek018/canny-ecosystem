import React from "react";
import { Input } from "@canny_ecosystem/ui/input";
import { Icon } from "@canny_ecosystem/ui/icon";
import { MultiSelectCombobox } from "@canny_ecosystem/ui/multi-select-combobox";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import type { PayrollDatabaseRow } from "@canny_ecosystem/supabase/types";
interface FilterControlsProps {
  searchString: string;
  onSearchChange: (value: string) => void;
  siteOptions: ComboboxSelectOption[];
  departmentOptions: ComboboxSelectOption[];
  selectedSiteIds: string[];
  selectedDeptIds: string[];
  onFieldChange: (fields: string[]) => void;
  payrollData: Omit<PayrollDatabaseRow, "created_at">;
}

export const FilterControls = React.memo<FilterControlsProps>(
  ({
    searchString,
    onSearchChange,
    siteOptions,
    departmentOptions,
    selectedSiteIds,
    selectedDeptIds,
    onFieldChange,
    payrollData,
  }) => {
    const conditionalOptions = () => {
      if (payrollData?.project_id) return siteOptions;
      if (payrollData?.site_id) return departmentOptions;

      return [
        siteOptions?.length && { label: "Sites", value: "separator" },
        ...siteOptions,
        departmentOptions?.length && {
          label: "Departments",
          value: "separator",
        },
        ...departmentOptions,
      ].filter(Boolean);
    };

    const handleRenderSelectedItem = (values: string[]): string => {
      if (values.length === 0) return "";

      if (values.length <= 3) {
        const selectedSites = selectedSiteIds.length > 0;
        const selectedDepts = selectedDeptIds.length > 0;

        if (selectedSites && !selectedDepts) {
          return `Site: ${siteOptions
            .filter((option) => values.includes(String(option.value)))
            .map((option) => option.label)
            .join(", ")}`;
        }

        if (selectedDepts && !selectedSites) {
          return `Dep: ${departmentOptions
            .filter((option) => values.includes(String(option.value)))
            .map((option) => option.label)
            .join(", ")}`;
        }

        if (selectedSites && selectedDepts) {
          const siteLabels = siteOptions
            .filter((option) => values.includes(String(option.value)))
            .map((option) => option.label)
            .join(", ");
          const deptLabels = departmentOptions
            .filter((option) => values.includes(String(option.value)))
            .map((option) => option.label)
            .join(", ");
          return `Site: ${siteLabels} | Dep: ${deptLabels}`;
        }
      }

      return `${values.length} selected`;
    };

    const showFilters = siteOptions.length > 0 || departmentOptions.length > 0;

    return (
      <div className="w-full flex items-center justify-between gap-3">
        <div className={cn("w-2/3", !showFilters && "hidden")}>
          <MultiSelectCombobox
            label="Groups"
            options={conditionalOptions() as any[]}
            value={[...selectedSiteIds, ...selectedDeptIds]}
            onChange={onFieldChange}
            renderItem={(option) => (
              <div
                role="option"
                aria-selected={selectedDeptIds.includes(String(option.value))}
              >
                {option.label}
              </div>
            )}
            renderSelectedItem={handleRenderSelectedItem}
            aria-label="Filter by payment field"
            aria-required="false"
            aria-multiselectable="true"
            aria-describedby="payment-field-description"
          />
          <span id="payment-field-description" className="sr-only">
            Select one or more payment fields. Shows individual payment fields
            names when 3 or fewer are selected.
          </span>
        </div>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="magnifying-glass" size="sm" className="text-gray-400" />
          </div>
          <Input
            placeholder="Search Salary Entries"
            value={searchString}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-10 w-full focus-visible:ring-0 shadow-none"
          />
        </div>
      </div>
    );
  },
);

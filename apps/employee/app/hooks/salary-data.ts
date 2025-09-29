import { useMemo, useState, useCallback } from "react";
import { searchInObject } from "@canny_ecosystem/utils";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export const useSalaryData = (data: any[]) => {
  const [searchString, setSearchString] = useState("");
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);

  // Memoize options to prevent recalculation
  const { siteOptions, departmentOptions } = useMemo(() => {
    const siteMap = new Map<string, ComboboxSelectOption>();
    const deptMap = new Map<string, ComboboxSelectOption>();

    for (const entry of data) {
      const salaryEntry = entry.employee.work_details;
      if (!salaryEntry) continue;

      // Process site options
      const { site, site_id } = salaryEntry;
      if (site && site_id && !siteMap.has(site_id)) {
        siteMap.set(site_id, {
          label: site.name,
          value: site_id,
          pseudoLabel: site.projects?.name,
        });
      }

      // Process department options
      const { department, department_id } = salaryEntry;
      if (department && department_id && !deptMap.has(department_id)) {
        deptMap.set(department_id, {
          label: department.name,
          value: department_id,
          pseudoLabel: department.sites?.name,
        });
      }
    }

    return {
      siteOptions: Array.from(siteMap.values()),
      departmentOptions: Array.from(deptMap.values()),
    };
  }, [data]);

  // Memoize filtered data
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search filter
    if (searchString) {
      result = result.filter((item) => searchInObject(item, searchString));
    }

    // Apply site/department filters
    const hasSiteFilter = selectedSiteIds.length > 0;
    const hasDeptFilter = selectedDeptIds.length > 0;

    if (hasSiteFilter || hasDeptFilter) {
      result = result.filter((item) => {
        const siteId = String(item.employee?.work_details?.site_id || "");
        const deptId = String(item.employee?.work_details?.department_id || "");

        const matchesSite = !hasSiteFilter || selectedSiteIds.includes(siteId);
        const matchesDept = !hasDeptFilter || selectedDeptIds.includes(deptId);

        return matchesSite && matchesDept;
      });
    }

    return result;
  }, [data, searchString, selectedSiteIds, selectedDeptIds]);

  const handleFieldChange = useCallback(
    (newSelectedFields: string[]) => {
      if (!newSelectedFields.length) {
        setSelectedSiteIds([]);
        setSelectedDeptIds([]);
        return;
      }

      const siteIds = siteOptions.map((opt) => opt.value);
      const deptIds = departmentOptions.map((opt) => opt.value);

      setSelectedSiteIds(
        newSelectedFields.filter((id) => siteIds.includes(id)),
      );
      setSelectedDeptIds(
        newSelectedFields.filter((id) => deptIds.includes(id)),
      );
    },
    [siteOptions, departmentOptions],
  );

  return {
    siteOptions,
    departmentOptions,
    filteredData,
    searchString,
    setSearchString,
    selectedSiteIds,
    selectedDeptIds,
    handleFieldChange,
  };
};

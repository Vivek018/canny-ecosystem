import { ImportedDataColumns } from "@/components/employees/imported-employee-details-table/columns";
import { ImportedDataTable } from "@/components/employees/imported-employee-details-table/imported-data-table";
import { cacheKeyPrefix } from "@/constant";
import { useImportStoreForEmployeeDetails } from "@/store/import";
import { clearCacheEntry } from "@/utils/cache";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import {
  createEmployeeDetailsFromImportedData,
  createEmployeeWorkDetailsFromImportedData,
  getEmployeeDetailsConflicts,
} from "@canny_ecosystem/supabase/mutations";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  duplicationTypeArray,
  ImportEmployeeDetailsDataSchema,
  isGoodStatus,
  normalizeNames,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";
import { LoadingSpinner } from "@/components/loading-spinner";

import { useState, useEffect } from "react";
import { getDepartmentsByCompanyId } from "@canny_ecosystem/supabase/queries";

export function EmployeeDetailsImportData({
  env,
  conflictingIndices,
  companyId,
}: {
  env: SupabaseEnv;
  conflictingIndices: number[];
  companyId: string;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { supabase } = useSupabase({ env });
  const { importData } = useImportStoreForEmployeeDetails();
  const [conflictingIndex, setConflictingIndex] =
    useState<number[]>(conflictingIndices);
  const [searchString, setSearchString] = useState("");
  const [importType, setImportType] = useState<string>("skip");
  const [tableData, setTableData] = useState(importData.data);
  const [isImporting, setIsImporting] = useState(false);

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportEmployeeDetailsDataSchema.safeParse({ data });
      if (!result.success) {
        console.error("Employee Details Data validation error");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Employee Details Data validation error:", error);

      return false;
    }
  };

  const fetchConflicts = async () => {
    try {
      const { conflictingIndices, error } = await getEmployeeDetailsConflicts({
        supabase,
        importedData: importData?.data,
      });

      if (error) {
        throw error;
      }

      setConflictingIndex(conflictingIndices);
    } catch (err) {
      console.error("Employee Details Error fetching conflicts:", err);
    }
  };

  useEffect(() => {
    if (importData) {
      fetchConflicts();
    }
  }, [importData]);

  useEffect(() => {
    const filteredData = importData?.data.filter((item) =>
      Object.entries(item).some(
        ([key, value]) =>
          key !== "avatar" &&
          String(value).toLowerCase().includes(searchString.toLowerCase()),
      ),
    );
    setTableData(filteredData);
  }, [searchString, importData]);

  const handleFinalImport = async () => {
    if (validateImportData(importData.data)) {
      setIsImporting(true);

      const { data: departments, error: departmentError } =
        await getDepartmentsByCompanyId({
          supabase,
          companyId,
        });

      if (departmentError) throw departmentError;

      const departmentMap = new Map(
        (departments ?? []).map((d) => [normalizeNames(d.name), d.id]),
      );

      const preData = importData.data.map((item: any) => {
        const departmentId = departmentMap.get(normalizeNames(item.department));

        const { department, ...rest } = item;

        return {
          ...rest,
          ...(departmentId ? { department_id: departmentId } : {}),
        };
      });

      const employeesData = preData.map((entry) => ({
        employee_code: entry.employee_code,
        first_name: entry.first_name,
        middle_name: entry.middle_name,
        last_name: entry.last_name,
        date_of_birth: entry.date_of_birth,
        gender: entry.gender,
        education: entry.education,
        marital_status: entry.marital_status,
        nationality: entry.nationality,
        primary_mobile_number: entry.primary_mobile_number,
        secondary_mobile_number: entry.secondary_mobile_number,
        personal_email: entry.personal_email,
        is_active: entry.is_active,
        company_id: companyId,
      }));

      const {
        error: employeeError,
        status: employeeStatus,
        employees,
      } = await createEmployeeDetailsFromImportedData({
        data: employeesData,
        import_type: importType,
        supabase,
      });

      const empCodeToId = Object.fromEntries(
        employees!.map((emp) => [emp.employee_code, emp.id]),
      );

      const workDetailsData = preData.map((entry) => ({
        employee_id: empCodeToId[entry.employee_code],
        site_id: entry.site_id,
        position: entry.position,
        start_date: entry.start_date,
        end_date: entry.end_date,
        assignment_type: entry.assignment_type,
        skill_level: entry.skill_level,
        probation_period: entry.probation_period,
        probation_end_date: entry.probation_end_date,
        department_id: entry.department_id,
        employee_code: entry.employee_code,
      }));

      const { error: workDetailsError, status: wordDetailsStatus } =
        await createEmployeeWorkDetailsFromImportedData({
          data: workDetailsData,
          import_type: importType,
          supabase,
        });

      setIsImporting(false);

      if (employeeError || workDetailsError) {
        toast({
          title: "Error",
          description:
            JSON.stringify(employeeError) ??
            JSON.stringify(workDetailsError) ??
            "Failed to import details",
          variant: "destructive",
        });
      }

      if (isGoodStatus(employeeStatus) && isGoodStatus(wordDetailsStatus)) {
        toast({
          title: "Success",
          description: "Details imported succesfully",
          variant: "success",
        });
        clearCacheEntry(cacheKeyPrefix.employee_overview);
        clearCacheEntry(cacheKeyPrefix.employee_work_portfolio);
        clearCacheEntry(cacheKeyPrefix.employees);
        navigate("/employees");
      }
    }
  };

  return (
    <section className="px-4 relative">
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80",
          isImporting ? "block" : "hidden",
        )}
      >
        <LoadingSpinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0" />
      </div>
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full  flex justify-between items-center">
          <div className="relative w-[30rem] ">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon
                name="magnifying-glass"
                size="sm"
                className="text-gray-400"
              />
            </div>
            <Input
              placeholder="Search Employees"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="pl-8 h-10 w-full focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-3">
            <Combobox
              className={cn(
                "w-52 h-10",
                conflictingIndex?.length > 0 ? "flex" : "hidden",
              )}
              options={transformStringArrayIntoOptions(
                duplicationTypeArray as unknown as string[],
              )}
              value={importType}
              onChange={(value: string) => {
                setImportType(value);
              }}
              placeholder={"Select Import Type"}
            />
            <Button variant={"default"} onClick={handleFinalImport}>
              Import
            </Button>
          </div>
        </div>
      </div>
      <input type="hidden" name="import_type" value={importType} />
      <input
        name="stringified_data"
        type="hidden"
        value={JSON.stringify(importData)}
      />
      <ImportedDataTable
        data={tableData}
        columns={ImportedDataColumns}
        conflictingIndex={conflictingIndex}
      />
    </section>
  );
}

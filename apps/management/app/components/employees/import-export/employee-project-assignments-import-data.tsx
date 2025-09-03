import { cacheKeyPrefix } from "@/constant";
import { useImportStoreForEmployeeProjectAssignments } from "@/store/import";
import { clearCacheEntry } from "@/utils/cache";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import type {
  EmployeeProjectAssignmentDatabaseInsert,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  duplicationTypeArray,
  ImportEmployeeProjectAssignmentsDataSchema,
  isGoodStatus,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";
import { LoadingSpinner } from "@/components/loading-spinner";

import { useState, useEffect } from "react";
import { ImportedDataColumns } from "../imported-employee-project-assignments-table/columns";
import { ImportedDataTable } from "../imported-employee-project-assignments-table/imported-data-table";
import {
  getEmployeeIdsByEmployeeCodes,
  getEmployeeProjectAssignmentsConflicts,
  getSiteIdsBySiteNames,
} from "@canny_ecosystem/supabase/queries";
import { createEmployeeProjectAssignmentsFromImportedData } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export function EmployeeProjectAssignmentsImportData({
  env,
  conflictingIndices,
}: {
  env: SupabaseEnv;
  conflictingIndices: number[];
  companyId: string;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { supabase } = useSupabase({ env });
  const { importData } = useImportStoreForEmployeeProjectAssignments();
  const [conflictingIndex, setConflictingIndex] =
    useState<number[]>(conflictingIndices);
  const [searchString, setSearchString] = useState("");
  const [importType, setImportType] = useState<string>("skip");
  const [tableData, setTableData] = useState(importData.data);
  const [finalData, setFinalData] =
    useState<EmployeeProjectAssignmentDatabaseInsert[]>();
  const [isImporting, setIsImporting] = useState(false);

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportEmployeeProjectAssignmentsDataSchema.safeParse({
        data,
      });
      if (!result.success) {
        console.error("Employee Project Assignments Data validation error");
        return false;
      }
      return true;
    } catch (error) {
      console.error(
        "Employee Project Assignments Data validation error:",
        error,
      );

      return false;
    }
  };

  const fetchConflicts = async () => {
    try {
      const employeeCodes = importData.data!.map(
        (value: { employee_code: any }) => value.employee_code,
      );
      const { data: employees, error: idByCodeError } =
        await getEmployeeIdsByEmployeeCodes({
          supabase,
          employeeCodes,
        });

      if (idByCodeError) {
        throw idByCodeError;
      }
      const siteNames = importData.data!.map(
        (value: { site: any }) => value.site,
      );
      const { data: sites, error: idBySiteName } = await getSiteIdsBySiteNames({
        supabase,
        siteNames,
      });

      if (idBySiteName) {
        throw idBySiteName;
      }

      const updatedData = importData.data!.map((item: any) => {
        const employeeId = employees?.find(
          (e: { employee_code: any }) => e.employee_code === item.employee_code,
        )?.id;
        const siteId = sites?.find(
          (e: { name: any }) => e.name === item.site,
        )?.id;

        const { employee_code, site, ...rest } = item;
        return {
          ...rest,
          ...(employeeId ? { employee_id: employeeId } : {}),
          ...(siteId ? { site_id: siteId } : {}),
        };
      });

      setFinalData(updatedData);
      const { conflictingIndices, error } =
        await getEmployeeProjectAssignmentsConflicts({
          supabase,
          importedData:
            updatedData as EmployeeProjectAssignmentDatabaseInsert[],
        });

      if (error) {
        throw error;
      }

      setConflictingIndex(conflictingIndices);
    } catch (err) {
      console.error(
        "Employee Project Assignments Error fetching conflicts:",
        err,
      );
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
      const { error, status } =
        await createEmployeeProjectAssignmentsFromImportedData({
          data: finalData as EmployeeProjectAssignmentDatabaseInsert[],
          import_type: importType,
          supabase,
        });

      setIsImporting(false);

      if (error) {
        toast({
          title: "Error",
          description: JSON.stringify(error) ?? "Failed to import details",
          variant: "destructive",
        });
      }

      if (isGoodStatus(status)) {
        toast({
          title: "Success",
          description: "Details imported succesfully",
          variant: "success",
        });
        clearCacheEntry(cacheKeyPrefix.employees);
        clearCacheEntry(cacheKeyPrefix.employee_overview);
        navigate("/employees");
      }
    }
  };

  return (
    <section className="p-4 relative">
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

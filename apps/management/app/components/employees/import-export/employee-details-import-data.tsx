import { ImportedDataColumns } from "@/components/employees/imported-employee-details-table/columns";
import { ImportedDataTable } from "@/components/employees/imported-employee-details-table/imported-data-table";
import { cacheKeyPrefix } from "@/constant";
import { useImportStoreForEmployeeDetails } from "@/store/import";
import { clearCacheEntry } from "@/utils/cache";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import {
  createEmployeeDetailsFromImportedData,
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
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";

import { useState, useEffect } from "react";

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
      const updatedData = importData.data.map((entry) => ({
        ...entry,
        company_id: companyId,
      }));

      const { error, status } = await createEmployeeDetailsFromImportedData({
        data: updatedData,
        import_type: importType,
        supabase,
      });

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
        clearCacheEntry(cacheKeyPrefix.employee_overview);
        clearCacheEntry(cacheKeyPrefix.employees);
        navigate("/employees");
      }
    }
  };

  return (
    <section className="p-4">
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

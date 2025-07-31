import { useImportStoreForExit } from "@/store/import";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import {
  createExitsFromImportedData,
  getExitsConflicts,
} from "@canny_ecosystem/supabase/mutations";
import { getEmployeeIdsByEmployeeCodes } from "@canny_ecosystem/supabase/queries";
import type { ExitsInsert, SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import {
  duplicationTypeArray,
  ImportExitDataSchema,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ImportedDataTable } from "../imported-table/imported-data-table";
import { ImportedDataColumns } from "../imported-table/columns";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export function ExitImportData({
  env,
  conflictingIndices,
}: {
  env: SupabaseEnv;
  conflictingIndices: number[];
}) {
  const [importType, setImportType] = useState<string>("skip");
  const [conflictingIndex, setConflictingIndex] =
    useState<number[]>(conflictingIndices);
  const navigate = useNavigate();
  const { supabase } = useSupabase({ env });
  const { importData } = useImportStoreForExit();
  const [finalData, setFinalData] = useState<ExitsInsert[]>();
  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(importData.data);

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportExitDataSchema.safeParse({ data });
      if (!result.success) {
        console.error("Exit Data validation error");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Exit Data validation error:", error);
      return false;
    }
  };

  const fetchConflicts = async () => {
    try {
      const employeeCodes = importData.data!.map(
        (value: { employee_code: any }) => value.employee_code
      );
      const { data: employees, error: idByCodeError } =
        await getEmployeeIdsByEmployeeCodes({
          supabase,
          employeeCodes,
        });

      if (idByCodeError) {
        throw idByCodeError;
      }

      const updatedData = importData.data!.map((item: any) => {
        const employeeId = employees?.find(
          (e: { employee_code: any }) => e.employee_code === item.employee_code
        )?.id;

        const { employee_code, ...rest } = item;
        return {
          ...rest,
          ...(employeeId ? { employee_id: employeeId } : {}),
        };
      });

      setFinalData(updatedData);
      const { conflictingIndices, error } = await getExitsConflicts({
        supabase,
        importedData: updatedData,
      });

      if (error) {
        throw error;
      }

      setConflictingIndex(conflictingIndices);
    } catch (err) {
      console.error("Exits Error fetching conflicts:", err);
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
          String(value).toLowerCase().includes(searchString.toLowerCase())
      )
    );
    setTableData(filteredData);
  }, [searchString, importData]);

  const handleFinalImport = async () => {
    if (validateImportData(importData.data)) {
      const { error, status } = await createExitsFromImportedData({
        data: finalData as ExitsInsert[],
        import_type: importType,
        supabase,
      });

      if (error) {
        console.error("Employee Bank ", error);
      }
      if (isGoodStatus(status)) {
        clearCacheEntry(cacheKeyPrefix.exits);
        navigate("/approvals/exits");
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
                conflictingIndex?.length > 0 ? "flex" : "hidden"
              )}
              options={transformStringArrayIntoOptions(
                duplicationTypeArray as unknown as string[]
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

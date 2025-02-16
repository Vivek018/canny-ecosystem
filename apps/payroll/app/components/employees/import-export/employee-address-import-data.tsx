import { ImportedDataColumns } from "@/components/employees/imported-address-table/columns";
import { ImportedDataTable } from "@/components/employees/imported-address-table/imported-data-table";
import { cacheKeyPrefix } from "@/constant";
import { useImportStoreForEmployeeAddress } from "@/store/import";
import { clearCacheEntry } from "@/utils/cache";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { createEmployeeAddressFromImportedData } from "@canny_ecosystem/supabase/mutations";
import { getEmployeeIdsByEmployeeCodes } from "@canny_ecosystem/supabase/queries";
import type {
  EmployeeAddressDatabaseInsert,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  duplicationTypeArray,
  ImportEmployeeAddressDataSchema,
  isGoodStatus,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";

import { useState, useEffect } from "react";

export function EmployeeAddressImportData({ env }: { env: SupabaseEnv }) {
  const navigate = useNavigate();
  const { supabase } = useSupabase({ env });
  const { importData } = useImportStoreForEmployeeAddress();

  const [searchString, setSearchString] = useState("");
  const [importType, setImportType] = useState<string>("skip");
  const [tableData, setTableData] = useState(importData.data);

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportEmployeeAddressDataSchema.safeParse({ data });
      if (!result.success) {
        console.error("Employee Address Data validation error");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Employee Address Data validation error:", error);

      return false;
    }
  };

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

      const updatedData = importData.data!.map((item: any) => {
        const employeeId = employees?.find(
          (e: { employee_code: any }) => e.employee_code === item.employee_code,
        )?.id;

        const { employee_code, ...rest } = item;
        return {
          ...rest,
          ...(employeeId ? { employee_id: employeeId } : {}),
        };
      });

      const { error, status } = await createEmployeeAddressFromImportedData({
        data: updatedData as EmployeeAddressDatabaseInsert[],

        supabase,
      });

      if (error) {
        console.error("Employee Address", error);
      }
      if (isGoodStatus(status)) {
        clearCacheEntry(cacheKeyPrefix.employee_overview);
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
              className={cn("w-52 h-10")}
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
      <ImportedDataTable data={tableData} columns={ImportedDataColumns} />
    </section>
  );
}

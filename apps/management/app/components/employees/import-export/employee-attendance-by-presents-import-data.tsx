import { useImportStoreForEmployeeAttendanceByPresents } from "@/store/import";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { getEmployeeIdsByEmployeeCodes } from "@canny_ecosystem/supabase/queries";
import type {
  EmployeeAttendanceDatabaseInsert,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { useNavigate } from "@remix-run/react";

import { useState, useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { ImportedDataTable } from "../imported-attendance-by-presents-table/imported-data-table";
import { ImportedDataColumns } from "../imported-attendance-by-presents-table/columns";
import { createEmployeeAttendanceByPresentsFromImportedData } from "@canny_ecosystem/supabase/mutations";

export function EmployeeAttendanceByPresentsImportData({
  env,
}: {
  env: SupabaseEnv;
}) {
  const navigate = useNavigate();
  const { supabase } = useSupabase({ env });
  const { importData } = useImportStoreForEmployeeAttendanceByPresents();

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(importData.data);

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
    const employeeCodes = importData.data!.map((value) => value.employee_code);
    const { data: employees, error: codeError } =
      await getEmployeeIdsByEmployeeCodes({
        supabase,
        employeeCodes,
      });
    if (codeError) throw codeError;

    const updatedData = importData.data!.map((item: any) => {
      const employeeId = employees?.find(
        (e) => e.employee_code === item.employee_code
      )?.id;
      const { employee_code, ...rest } = item;
      return {
        ...rest,
        ...(employeeId ? { employee_id: employeeId } : {}),
      };
    });

    const expandedData = updatedData.flatMap((item: any) => {
      const { present_days, month, year, employee_id } = item;
      const totalDays = new Date(year, month, 0).getDate();

      const presentCount = Number(present_days);
      const presentDates = new Set(
        Array.from({ length: presentCount }, (_, i) => i + 1)
      );

      return Array.from({ length: totalDays }, (_, i) => {
        const day = i + 1;
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;

        return {
          employee_id,
          date: dateStr,
          present: presentDates.has(day),
        };
      });
    });

    const { error, status } =
      await createEmployeeAttendanceByPresentsFromImportedData({
        data: expandedData as EmployeeAttendanceDatabaseInsert[],
        supabase,
      });

    if (error) {
      console.error("Employee Attendance By Presents", error);
    }
    if (
      status === "No new data to insert after filtering duplicates" ||
      status === "Successfully inserted new records" ||
      status === "Successfully processed updates and new insertions"
    ) {
      clearCacheEntry(cacheKeyPrefix.attendance);
      navigate("/time-tracking/attendance");
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
            <Button variant={"default"} onClick={handleFinalImport}>
              Import
            </Button>
          </div>
        </div>
      </div>
      <ImportedDataTable data={tableData} columns={ImportedDataColumns} />
    </section>
  );
}

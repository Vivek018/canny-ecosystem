import { useImportStoreForSalaryPayroll } from "@/store/import";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { getEmployeeIdsByEmployeeCodes } from "@canny_ecosystem/supabase/queries";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { useSubmit } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ImportedDataTable } from "../salary-imported-table/imported-data-table";
import { ImportedDataColumns } from "../salary-imported-table/columns";
import type { FieldConfig } from "@/routes/_protected+/payroll+/run-payroll+/import-salary-payroll+/_index";

export function SalaryPayrollImportData({
  env,
  fieldConfigs,
}: {
  env: SupabaseEnv;
  fieldConfigs: FieldConfig[];
}) {
  const submit = useSubmit();
  const { supabase } = useSupabase({ env });
  const { importData } = useImportStoreForSalaryPayroll();

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

    submit(
      {
        type: "salary-import",
        salaryImportData: JSON.stringify(updatedData),
        failedRedirect: "/payroll",
      },
      {
        method: "POST",
        action: "/create-payroll",
      }
    );
  };

  return (
    <section className="px-4">
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
              placeholder="Search Payroll"
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

      <ImportedDataTable
        data={tableData}
        columns={ImportedDataColumns(fieldConfigs)}
        fieldConfigs={fieldConfigs}
      />
    </section>
  );
}

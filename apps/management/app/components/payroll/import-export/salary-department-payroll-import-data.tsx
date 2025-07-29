import { useImportStoreForSalaryPayroll } from "@/store/import";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import {
  getEmployeeIdsByEmployeeCodes,
  getEmployeeIdsByEsicNumber,
  getEmployeeIdsByUanNumber,
} from "@canny_ecosystem/supabase/queries";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { useSubmit } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ImportedDataTable } from "../salary-imported-table/imported-data-table";
import { ImportedDataColumns } from "../salary-imported-table/columns";
import type { FieldConfig } from "@/routes/_protected+/payroll+/run-payroll+/import-salary-payroll+/_index";

export function SalaryDepartmentPayrollImportData({
  env,
  fieldConfigs,
  payrollId,
}: {
  payrollId: string;
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
          String(value).toLowerCase().includes(searchString.toLowerCase()),
      ),
    );
    setTableData(filteredData);
  }, [searchString, importData]);

  const handleFinalImport = async () => {
    const importEntries = importData.data! as any[];

    const employeeCodes = importEntries
      .map((entry) => entry.employee_code)
      .filter(Boolean);
    const {
      data: employeesByCode,
      error: codeError,
      missing: missingCodes,
    } = await getEmployeeIdsByEmployeeCodes({ supabase, employeeCodes });
    if (codeError) throw codeError;

    let unresolvedEntries = importEntries.filter((entry) =>
      missingCodes.includes(entry.employee_code),
    );

    const uanNumbers = unresolvedEntries
      .map((entry) => entry.uan_number)
      .filter(Boolean);

    const { data: employeesByUAN, error: uanError } =
      await getEmployeeIdsByUanNumber({ supabase, uan_number: uanNumbers });
    if (uanError) throw uanError;

    const resolvedUANs = employeesByUAN.map((e) => e.uan_number);
    unresolvedEntries = unresolvedEntries.filter(
      (entry) => !resolvedUANs.includes(entry.uan_number),
    );

    const esicNumbers = unresolvedEntries
      .map((entry) => entry.esic_number)
      .filter(Boolean);

    const { data: employeesByESIC, error: esicError } =
      await getEmployeeIdsByEsicNumber({ supabase, esic_number: esicNumbers });
    if (esicError) throw esicError;

    const allEmployees = [
      ...(employeesByCode?.map((e) => ({
        matchKey: e.employee_code,
        id: e.id,
        type: "employee_code",
      })) ?? []),
      ...(employeesByUAN?.map((e) => ({
        matchKey: e.uan_number,
        id: e.employee_id,
        type: "uan_number",
      })) ?? []),
      ...(employeesByESIC?.map((e) => ({
        matchKey: e.esic_number,
        id: e.employee_id,
        type: "esic_number",
      })) ?? []),
    ];

    const updatedData = importEntries
      .map((item) => {
        const matched = allEmployees.find(
          (e) =>
            (e.type === "employee_code" && e.matchKey === item.employee_code) ||
            (e.type === "uan_number" && e.matchKey === item.uan_number) ||
            (e.type === "esic_number" && e.matchKey === item.esic_number),
        );

        const { employee_code, uan_number, esic_number, ...rest } = item;
        return {
          ...rest,
          ...(matched ? { employee_id: matched.id } : {}),
        };
      })
      .filter((item) => item.employee_id);

    submit(
      {
        type: "salary-import",
        different: "different",
        payrollId: payrollId,
        salaryImportData: JSON.stringify(updatedData),
        skipped:
          importData.data.length - updatedData.length > 0
            ? importData.data.length - updatedData.length
            : 0,
        failedRedirect: updatedData[0].department_id
          ? `/payroll/run-payroll/${payrollId}?department=${updatedData[0]?.department_id}`
          : `/payroll/run-payroll/${payrollId}?site=${updatedData[0]?.site_id}`,
      },
      {
        method: "POST",
        action: "/create-payroll",
      },
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

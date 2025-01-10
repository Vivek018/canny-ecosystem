import { ImportedDataColumns } from "@/components/employees/imported-banking-table/columns";
import { ImportedDataTable } from "@/components/employees/imported-banking-table/imported-data-table";
import { useImportStoreForEmployeeBanking } from "@/store/import";
import type { ImportEmployeeBankingDataType } from "@canny_ecosystem/supabase/queries";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  duplicationTypeArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import Papa from "papaparse";
import { useState, useEffect } from "react";

export function EmployeeBankingImportData({
  fieldMapping,
  file,
  allAccountNumber,
}: {
  fieldMapping: Record<string, string>;
  file: any;
  allAccountNumber: any;
}) {
  const { importData, setImportData } = useImportStoreForEmployeeBanking();
  const [importType, setImportType] = useState<string>("skip");
  const [conflictingIndices, setConflictingIndices] = useState<number[]>([]);

  const swappedFieldMapping = Object.fromEntries(
    Object.entries(fieldMapping).map(([key, value]) => [value, key])
  );

  useEffect(() => {
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          return swappedFieldMapping[header] || header;
        },
        complete: (results) => {
          const finalTableData = results.data.filter((entry) =>
            Object.values(entry!).some((value) => String(value).trim() !== "")
          );

          setImportData({
            data: finalTableData as ImportEmployeeBankingDataType[],
          });
        },
        error: (error) => {
          console.error("Parsing error: ", error);
        },
      });
    }
  }, [file, fieldMapping]);

  useEffect(() => {
    const conflicts: number[] = [];

    importData.data.forEach((entry, index) => {
      const accountNumber = String(entry.account_number).trim();
      const accountNumbers = allAccountNumber.map(
        (item: { account_number: any }) => String(item.account_number).trim()
      );

      if (accountNumbers.includes(accountNumber)) {
        conflicts.push(index);
      }
    });

    setConflictingIndices(conflicts);
  }, [importData, allAccountNumber]);

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(importData.data);

  useEffect(() => {
    const filteredData = importData.data.filter((item) =>
      Object.entries(item).some(
        ([key, value]) =>
          key !== "avatar" &&
          String(value).toLowerCase().includes(searchString.toLowerCase())
      )
    );
    setTableData(filteredData);
  }, [searchString, importData]);

  return (
    <section className="m-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full  flex items-center gap-4">
          <div className="w-full flex gap-3">
            <div className="flex flex-1">
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
            <Combobox
              className={cn(
                "w-52 h-10",
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
          </div>
        </div>
      </div>
      <input
        name="stringified_data"
        type="hidden"
        value={JSON.stringify(importData)}
      />
      <input type="hidden" name="import_type" value={importType} />

      <ImportedDataTable
        data={tableData}
        columns={ImportedDataColumns}
        conflictingIndex={conflictingIndices}
      />
    </section>
  );
}

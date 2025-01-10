import { ImportedDataColumns } from "@/components/employees/imported-statutory-table/columns";
import { ImportedDataTable } from "@/components/employees/imported-statutory-table/imported-data-table";
import { useImportStoreForEmployeeStatutory } from "@/store/import";
import type { ImportEmployeeStatutoryDataType } from "@canny_ecosystem/supabase/queries";
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

export function EmployeeStatutoryImportData({
  fieldMapping,
  file,
  allNonDuplicants,
}: {
  fieldMapping: Record<string, string>;
  file: any;
  allNonDuplicants: any;
}) {
  const { importData, setImportData } = useImportStoreForEmployeeStatutory();
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
            data: finalTableData as ImportEmployeeStatutoryDataType[],
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
      const normalize = (value: any) => String(value).trim().toLowerCase();
      const isConflict = allNonDuplicants.some(
        (existing: any) =>
          normalize(existing.aadhaar_number) ===
            normalize(entry.aadhaar_number) ||
          normalize(existing.pan_number) === normalize(entry.pan_number) ||
          normalize(existing.uan_number) === normalize(entry.uan_number) ||
          normalize(existing.pf_number) === normalize(entry.pf_number) ||
          normalize(existing.esic_number) === normalize(entry.esic_number) ||
          normalize(existing.driving_license_number) ===
            normalize(entry.pf_number) ||
          normalize(existing.passport_number) ===
            normalize(entry.passport_number)
      );

      if (isConflict) {
        conflicts.push(index);
      }
    });

    setConflictingIndices(conflicts);
  }, [importData, allNonDuplicants]);

  const [searchString, setSearchString] = useState("");
  const [importType, setImportType] = useState<string>("skip");
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
        <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
          <div className="relative w-full">
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
            className={cn("w-52 h-10")}
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
      <input type="hidden" name="import_type" value={importType} />
      <input
        name="stringified_data"
        type="hidden"
        value={JSON.stringify(importData)}
      />
      <ImportedDataTable
        data={tableData}
        columns={ImportedDataColumns}
        conflictingIndex={conflictingIndices}
      />
    </section>
  );
}

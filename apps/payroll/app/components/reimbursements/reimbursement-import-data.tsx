import { ImportedDataColumns } from "@/components/reimbursements/imported-table/columns";
import { ImportedDataTable } from "@/components/reimbursements/imported-table/imported-data-table";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import Papa from "papaparse";
import { useState, useEffect } from "react";

export function ReimbursementImportData({
  fieldMapping,
  file,
}: {
  fieldMapping: Record<string, string>;
  file: any;
}) {
  const [finalData, setFinalData] = useState<{ data: any[] }>({ data: [] });

  useEffect(() => {
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header,
        complete: (results) => {
          const finalTableData = results.data.filter((entry) =>
            Object.values(entry!).some((value) => String(value).trim() !== ""),
          );

          setFinalData({ data: finalTableData });
        },
        error: (error) => {
          console.error("Parsing error: ", error);
        },
      });
    }
  }, [file, fieldMapping]);

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(finalData.data);

  useEffect(() => {
    const filteredData = finalData.data.filter((item) =>
      Object.entries(item).some(
        ([key, value]) =>
          key !== "avatar" &&
          String(value).toLowerCase().includes(searchString.toLowerCase()),
      ),
    );
    setTableData(filteredData);
  }, [searchString, finalData]);

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
              placeholder="Search Reimbursements"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="pl-8 h-10 w-full focus-visible:ring-0"
            />
          </div>
        </div>
      </div>
      <input
        name="stringified_data"
        type="hidden"
        value={JSON.stringify(finalData)}
      />
      <ImportedDataTable data={tableData} columns={ImportedDataColumns} />
    </section>
  );
}

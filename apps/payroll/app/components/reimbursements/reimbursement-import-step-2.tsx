import { ImportedDataColumns } from "@/components/reimbursements/imported-table/columns";
import { ImportedDataTable } from "@/components/reimbursements/imported-table/imported-data-table";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { WholeArraySchema } from "@canny_ecosystem/utils";
import { useSubmit } from "@remix-run/react";
import Papa from "papaparse";
import { useState, useEffect } from "react";

export default function ReimbursementImportStep2({
  parsedData,
}: {
  parsedData: any;
}) {
  const { file, fieldMapping } = parsedData;
  const [finalData, setFinalData] = useState<any[]>([]);

  const reverseMapping = Object.entries(fieldMapping).reduce(
    (acc, [key, value]: any) => {
      acc[key.toLowerCase()] = value.toLowerCase();
      return acc;
    },
    {} as Record<string, string>
  );

  useEffect(() => {
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header,
        complete: (results) => {
          const finalTableData = results.data
            .filter((entry) =>
              Object.values(entry!).some((value) => String(value).trim() !== "")
            )
            .map((entry) => {
              const transformedEntry = Object.entries(entry!).reduce(
                (acc, [key, value]) => {
                  const newKey = reverseMapping[key.toLowerCase()] || key;

                  const stringValue = String(value).trim();

                  let newValue: string | boolean | number = stringValue;

                  if (key.toLowerCase() === "amount") {
                    
                    newValue = Number.isNaN(Number(stringValue))
                      ? stringValue
                      : Number(stringValue);
                  } else if (stringValue.toUpperCase() === "TRUE") {
                    newValue = true;
                  } else if (stringValue.toUpperCase() === "FALSE") {
                    newValue = false;
                  }

                  acc[newKey] = newValue;
                  return acc;
                },
                {} as Record<string, any>
              );

              const cleanedEntry = Object.fromEntries(
                Object.entries(transformedEntry).filter(
                  ([key, value]) =>
                    key.trim() !== "" && String(value).trim() !== ""
                )
              );

              return {
                ...cleanedEntry,
              };
            });

          setFinalData(finalTableData);
        },
        error: (error) => {
          console.error("Parsing error: ", error);
        },
      });
    }
  }, [file, fieldMapping]);

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState<any[]>(finalData);

  useEffect(() => {
    const filteredData = finalData.filter((item) =>
      Object.entries(item).some(
        ([key, value]) =>
          key !== "avatar" &&
          String(value).toLowerCase().includes(searchString.toLowerCase())
      )
    );
    setTableData(filteredData);
  }, [searchString, finalData]);

  const submit = useSubmit();

  const handleImportData = () => {
    const result = WholeArraySchema.safeParse(finalData);

    if (result.success) {
      submit(
        { finalData: JSON.stringify(result.data) },
        {
          method: "post",
          action: "imported-data",
          replace: true,
        }
      );
    } else {
      console.error("Validation failed", result.error.format());
    }
  };

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
          <Button onClick={handleImportData}>Confirm Import</Button>
        </div>
      </div>
      <ImportedDataTable data={tableData} columns={ImportedDataColumns} />
    </section>
  );
}

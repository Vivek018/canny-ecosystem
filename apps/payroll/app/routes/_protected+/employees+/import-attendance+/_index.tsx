import { useState } from "react";
import { json, useLoaderData, useLocation } from "@remix-run/react";
import Papa from "papaparse";
import { Button } from "@canny_ecosystem/ui/button";
import {
  getEmployeeIdsByEmployeeCodes,
  type ImportEmployeeAttendanceDataType,
} from "@canny_ecosystem/supabase/queries";
import {
  ImportEmployeeAttendanceDataSchema,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";

import { EmployeeAttendanceImportData } from "@/components/employees/import-export/employee-attendance-import-data";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { useImportStoreForEmployeeAttendance } from "@/store/import";
import type {
  EmployeeAttendanceDatabaseInsert,
  EmployeeAttendanceDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { getEmployeeAttendanceConflicts } from "@canny_ecosystem/supabase/mutations";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { cn } from "@canny_ecosystem/ui/utils/cn";

const formatTypeArray = ["normal", "shift"] as const;

export async function loader() {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return json({ env });
}

export default function EmployeeAttendanceImportFieldMapping() {
  const [formatType, setFormatType] = useState<string>("normal");
  const { env } = useLoaderData<typeof loader>();
  const { supabase } = useSupabase({ env });

  const { setImportData } = useImportStoreForEmployeeAttendance();

  const [loadNext, setLoadNext] = useState(false);
  const [hasConflict, setHasConflict] = useState<number[]>([]);

  const location = useLocation();
  const [file] = useState(location.state?.file);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportEmployeeAttendanceDataSchema.safeParse({ data });
      if (!result.success) {
        const formattedErrors = result.error.errors.map(
          (err) => `${err.path[2]}: ${err.message}`
        );
        setValidationErrors(formattedErrors);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Data validation error:", error);
      setValidationErrors([
        "An unexpected error occurred during data validation",
      ]);
      return false;
    }
  };

  const handleParsedData = async () => {
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header,
        complete: async (results) => {
          const cleanedData = results.data
            .filter((entry) =>
              Object.values(entry!).some((value) => String(value).trim() !== "")
            )
            .map((entry) => {
              const cleanEntry = Object.fromEntries(
                Object.entries(entry as Record<string, any>).filter(
                  ([key, value]) =>
                    key.trim() !== "" &&
                    value !== null &&
                    String(value).trim() !== ""
                )
              );
              return cleanEntry;
            });

          const transformedData: ImportEmployeeAttendanceDataType[] = [];

          // biome-ignore lint/complexity/noForEach: <explanation>
          cleanedData.forEach((row) => {
            const employeeCode: string = row["EMPLOYEE CODE"];

            // biome-ignore lint/complexity/noForEach: <explanation>
            Object.entries(row).forEach(([key, value]) => {
              const [day, month, year] = key.split("-");
              if (!day || !month || !year) return;

              const monthMap: Record<string, string> = {
                Jan: "01",
                Feb: "02",
                Mar: "03",
                Apr: "04",
                May: "05",
                Jun: "06",
                Jul: "07",
                Aug: "08",
                Sep: "09",
                Oct: "10",
                Nov: "11",
                Dec: "12",
              };

              const date = `20${year}-${monthMap[month]}-${day.padStart(
                2,
                "0"
              )}`;
              const status = value?.toString().toUpperCase();

              let present = false;
              let holiday = false;
              let holidayType = null;
              let shift = null;

              if (formatType === "normal") {
                if (status === "P") {
                  present = true;
                } else if (status === "A") {
                  present = false;
                }
              }
              if (formatType === "shift") {
                if (status === "A") {
                  present = true;
                  shift = "day";
                } else if (status === "B") {
                  present = true;
                  shift = "afternoon";
                } else if (status === "C") {
                  present = true;
                  shift = "night";
                } else if (status === "AB") {
                  present = false;
                }
              }
              if (status === "(WOF)") {
                present = false;
                holiday = true;
                holidayType = "weekly";
              }
              if (status === "L") {
                present = false;
                holiday = true;
                holidayType = "paid";
              }

              transformedData.push({
                employee_code: employeeCode,
                date: date,
                present: present,
                holiday: holiday,
                holiday_type:
                  holidayType as EmployeeAttendanceDatabaseRow["holiday_type"],
                no_of_hours: 8,
                working_shift:
                  shift as EmployeeAttendanceDatabaseRow["working_shift"],
              });
            });
          });

          if (validateImportData(transformedData)) {
            setImportData({
              data: transformedData as ImportEmployeeAttendanceDataType[],
            });

            const employeeCodes = transformedData!.map(
              (value) => value.employee_code
            );
            const { data: employees, error: idByCodeError } =
              await getEmployeeIdsByEmployeeCodes({
                supabase,
                employeeCodes,
              });

            if (idByCodeError) {
              throw idByCodeError;
            }

            const updatedData = transformedData!.map((item: any) => {
              const employeeId = employees?.find(
                (e) => e.employee_code === item.employee_code
              )?.id;

              const { employee_code, ...rest } = item;
              return {
                ...rest,
                ...(employeeId ? { employee_id: employeeId } : {}),
              };
            });

            const { conflictingIndices, error } =
              await getEmployeeAttendanceConflicts({
                supabase,
                importedData: updatedData as EmployeeAttendanceDatabaseInsert[],
              });

            if (error) {
              throw error;
            }

            setHasConflict(conflictingIndices);
            setLoadNext(true);
          }
        },
        error: (error) => {
          console.error("Data parsing error:", error);
          setErrors((prev) => ({
            ...prev,
            parsing: "Error parsing file data",
          }));
        },
      });
    }
  };

  return (
    <section className="py-4 ">
      {loadNext ? (
        <EmployeeAttendanceImportData
          conflictingIndices={hasConflict}
          env={env}
        />
      ) : (
        <>
          <Combobox
            className={cn("w-52 h-10")}
            options={transformStringArrayIntoOptions(
              formatTypeArray as unknown as string[]
            )}
            value={formatType}
            onChange={(value: string) => {
              setFormatType(value);
            }}
            placeholder={"Select Import Type"}
          />
          <Button onClick={handleParsedData}>Sure</Button>
          <div className="flex flex-col items-end gap-2">
            <span className="text-red-500 text-sm">
              {errors.general}
              {validationErrors}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

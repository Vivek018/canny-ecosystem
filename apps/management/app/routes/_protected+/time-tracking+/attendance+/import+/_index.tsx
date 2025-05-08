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
import { Field } from "@canny_ecosystem/ui/forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

const formatTypeArray = [
  "normal",
  "shift",
  "hours",
  "custom(normal)",
  "custom(shift)",
] as const;

export async function loader() {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return json({ env });
}

export default function EmployeeAttendanceImportFieldMapping() {
  const [formatType, setFormatType] = useState<string>("normal");
  const [presentMap, setPresentMap] = useState<string>();
  const [absentMap, setAbsentMap] = useState<string>();
  const [weeklyOffMap, setWeeklyOffMap] = useState<string>();

  const [dayShift, setDayShift] = useState<string>();
  const [noonShift, setNoonShift] = useState<string>();
  const [nightShift, setNightShift] = useState<string>();

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
      console.error("Attendance Data validation error:", error);
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
              let noOfHours = 8;

              if (formatType === "normal") {
                if (status === "P") {
                  present = true;
                } else if (status === "A") {
                  present = false;
                  noOfHours = 0;
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
                  noOfHours = 0;
                }
              }
              if (formatType === "hours") {
                if (Number(status) > 0) {
                  present = true;
                  noOfHours = Number(status);
                } else if (Number(status) === 0) {
                  present = false;
                  noOfHours = Number(status);
                }
              }
              if (formatType === "custom(normal)") {
                if (status.toLowerCase() === `${presentMap?.toLowerCase()}`) {
                  present = true;
                } else if (
                  status.toLowerCase() === `${absentMap?.toLowerCase()}`
                ) {
                  present = false;
                  noOfHours = 0;
                } else if (
                  status.toLowerCase() === `${weeklyOffMap?.toLowerCase()}`
                ) {
                  present = false;
                  holiday = true;
                  holidayType = "weekly";
                  noOfHours = 0;
                }
              }
              if (formatType === "custom(shift)") {
                if (status.toLowerCase() === `${dayShift?.toLowerCase()}`) {
                  present = true;
                  shift = "day";
                } else if (
                  status.toLowerCase() === `${noonShift?.toLowerCase()}`
                ) {
                  present = true;
                  shift = "afternoon";
                } else if (
                  status.toLowerCase() === `${nightShift?.toLowerCase()}`
                ) {
                  present = true;
                  shift = "night";
                } else if (
                  status.toLowerCase() === `${absentMap?.toLowerCase()}`
                ) {
                  present = false;
                  noOfHours = 0;
                } else if (
                  status.toLowerCase() === `${weeklyOffMap?.toLowerCase()}`
                ) {
                  present = false;
                  holiday = true;
                  holidayType = "weekly";
                  noOfHours = 0;
                }
              }

              if (status === "(WOF)") {
                present = false;
                holiday = true;
                holidayType = "weekly";
                noOfHours = 0;
              }
              if (status === "L") {
                present = false;
                holiday = true;
                holidayType = "paid";
                noOfHours = 0;
              }

              transformedData.push({
                employee_code: employeeCode,
                date: date,
                present: present,
                holiday: holiday,
                holiday_type:
                  holidayType as EmployeeAttendanceDatabaseRow["holiday_type"],
                no_of_hours: noOfHours,
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
          console.error("Attendance Data parsing error:", error);
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
        <Card className="m-4 mx-auto w-1/3 flex flex-col items-center">
          <CardHeader>
            <CardTitle>Attendance Import Format</CardTitle>
            <CardDescription>
              Select your import-format for Attendace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Combobox
              className={cn("w-80 h-10 mr-4 mb-5")}
              options={transformStringArrayIntoOptions(
                formatTypeArray as unknown as string[]
              )}
              value={formatType}
              onChange={(value: string) => {
                setFormatType(value);
              }}
              placeholder={"Select Import Format"}
            />
            <Button onClick={handleParsedData}>Sure</Button>

            {formatType === "custom(normal)" && (
              <div
                className="grid mt-10
 grid-cols-2 place-content-center justify-between gap-3"
              >
                <Field
                  inputProps={{
                    type: "text",
                    value: presentMap!,
                    onChange: (e) => setPresentMap(e.target.value),
                    placeholder: "Enter for present",
                  }}
                />
                <Field
                  inputProps={{
                    type: "text",
                    value: absentMap!,
                    onChange: (e) => setAbsentMap(e.target.value),
                    placeholder: "Enter for Absent",
                  }}
                />
                <Field
                  inputProps={{
                    type: "text",
                    value: weeklyOffMap!,
                    onChange: (e) => setWeeklyOffMap(e.target.value),
                    placeholder: "Enter for Weekly Off",
                  }}
                />
              </div>
            )}
            {formatType === "custom(shift)" && (
              <>
                <div
                  className="grid mt-10
grid-cols-2 place-content-center gap-3"
                >
                  <Field
                    inputProps={{
                      type: "text",
                      value: dayShift!,
                      onChange: (e) => setDayShift(e.target.value),
                      placeholder: "Enter for Day-Shift",
                    }}
                  />
                  <Field
                    inputProps={{
                      type: "text",
                      value: noonShift!,
                      onChange: (e) => setNoonShift(e.target.value),
                      placeholder: "Enter for Afternoon-Shift",
                    }}
                  />
                </div>
                <div
                  className="grid mt-4
grid-cols-2 place-content-center justify-between gap-3"
                >
                  <Field
                    inputProps={{
                      type: "text",
                      value: nightShift!,
                      onChange: (e) => setNightShift(e.target.value),
                      placeholder: "Enter for Night-shift",
                    }}
                  />
                  <Field
                    inputProps={{
                      type: "text",
                      value: absentMap!,
                      onChange: (e) => setAbsentMap(e.target.value),
                      placeholder: "Enter for Absent",
                    }}
                  />
                  <Field
                    inputProps={{
                      type: "text",
                      value: weeklyOffMap!,
                      onChange: (e) => setWeeklyOffMap(e.target.value),
                      placeholder: "Enter for Weekly Off",
                    }}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <div
              className="grid
grid-cols-1 gap-2"
            >
              <span className="text-red-500 text-sm">
                {errors.errors}
                {validationErrors[0]}
              </span>
            </div>
          </CardFooter>
        </Card>
      )}
    </section>
  );
}

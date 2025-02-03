import { useState } from "react";
import { json, useLoaderData, useLocation } from "@remix-run/react";
import Papa from "papaparse";
import { Button } from "@canny_ecosystem/ui/button";
import {
  getEmployeeIdsByEmployeeCodes,
  type ImportEmployeeAttendanceDataType,
} from "@canny_ecosystem/supabase/queries";
import { ImportEmployeeAttendanceDataSchema } from "@canny_ecosystem/utils";

import { EmployeeAttendanceImportData } from "@/components/employees/import-export/employee-attendance-import-data";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { useImportStoreForEmployeeAttendance } from "@/store/import";
import type { EmployeeAttendanceDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { getEmployeeAttendanceConflicts } from "@canny_ecosystem/supabase/mutations";

export async function loader() {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return json({ env });
}

export default function EmployeeAttendanceImportFieldMapping() {
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
          const finalData = results.data
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

          if (validateImportData(finalData)) {
            setImportData({
              data: finalData as ImportEmployeeAttendanceDataType[],
            });

            const employeeCodes = finalData!.map(
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

            const updatedData = finalData!.map((item: any) => {
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

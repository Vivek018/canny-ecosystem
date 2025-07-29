import { useState, useEffect } from "react";
import { json, useLoaderData, useLocation } from "@remix-run/react";
import Papa from "papaparse";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { Button } from "@canny_ecosystem/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  ImportExitDataSchema,
  ImportExitHeaderSchema,
} from "@canny_ecosystem/utils";
import {
  getEmployeeIdsByEmployeeCodes,
  type ImportExitDataType,
} from "@canny_ecosystem/supabase/queries";
import {
  transformStringArrayIntoOptions,
  replaceUnderscore,
  pipe,
  replaceDash,
} from "@canny_ecosystem/utils";
import type { z } from "zod";

import { useImportStoreForExit } from "@/store/import";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { ExitImportData } from "@/components/exits/import-export/exit-import-data";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { getExitsConflicts } from "@canny_ecosystem/supabase/mutations";

type FieldConfig = {
  key: keyof z.infer<typeof ImportExitHeaderSchema>;
  required?: boolean;
};

const FIELD_CONFIGS: FieldConfig[] = [
  { key: "employee_code", required: true },
  { key: "last_working_day", required: true },
  { key: "reason", required: true },
  { key: "final_settlement_date", required: true },
  { key: "payable_days", required: true },
  { key: "bonus", required: true },
  { key: "leave_encashment", required: true },
  { key: "gratuity", required: true },
  { key: "deduction", required: true },
  { key: "note", required: true },
];

export async function loader() {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  return json({ env });
}

export default function ExitFieldMapping() {
  const { env } = useLoaderData<typeof loader>();
  const { supabase } = useSupabase({ env });
  const { setImportData } = useImportStoreForExit();
  const [loadNext, setLoadNext] = useState(false);
  const location = useLocation();
  const [hasConflict, setHasConflict] = useState<number[]>([]);
  const [file] = useState(location.state?.file);
  const [headerArray, setHeaderArray] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (file) {
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<string[]>) => {
          const headers = results.data[0].filter(
            (header) => header !== null && header.trim() !== "",
          );
          setHeaderArray(headers);
        },
        error: (error) => {
          console.error("Exit Header parsing error:", error);
          setErrors((prev) => ({ ...prev, parsing: "Error parsing headers" }));
        },
      });
    }
  }, [file]);

  useEffect(() => {
    if (headerArray.length > 0) {
      const initialMapping = FIELD_CONFIGS.reduce(
        (mapping, field) => {
          const matchedHeader = headerArray.find(
            (value) =>
              pipe(replaceUnderscore, replaceDash)(value?.toLowerCase()) ===
              pipe(replaceUnderscore, replaceDash)(field.key?.toLowerCase()),
          );

          if (matchedHeader) mapping[field.key] = matchedHeader;

          return mapping;
        },
        {} as Record<string, string>,
      );

      setFieldMapping(initialMapping);
    }
  }, [headerArray]);

  const validateMapping = () => {
    try {
      const mappingResult = ImportExitHeaderSchema.safeParse(
        Object.fromEntries(
          Object.entries(fieldMapping).map(([key, value]) => [
            key,
            value || undefined,
          ]),
        ),
      );

      if (!mappingResult.success) {
        const formattedErrors = mappingResult.error.errors.map(
          (err) => err.message,
        );
        setValidationErrors(formattedErrors);
        return false;
      }

      setValidationErrors([]);
      return true;
    } catch (error) {
      console.error("Exit Validation error:", error);
      setValidationErrors(["An unexpected error occurred during validation"]);
      return false;
    }
  };

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportExitDataSchema.safeParse({ data });
      if (!result.success) {
        const formattedErrors = result.error.errors.map(
          (err) => `${err.path[2]}: ${err.message}`,
        );
        setValidationErrors(formattedErrors);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exit Data validation error:", error);
      setValidationErrors([
        "An unexpected error occurred during data validation",
      ]);
      return false;
    }
  };

  const handleMapping = (key: string, value: string) => {
    setFieldMapping((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
    setValidationErrors([]);
  };

  const handleParsedData = async () => {
    if (!validateMapping()) return;

    const swappedFieldMapping = Object.fromEntries(
      Object.entries(fieldMapping).map(([key, value]) => [value, key]),
    );

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => swappedFieldMapping[header] || header,
        complete: async (results) => {
          const allowedData = FIELD_CONFIGS.map((field) => field.key);
          const finalData = results.data
            .filter((entry) =>
              Object.values(entry!).some(
                (value) => String(value).trim() !== "",
              ),
            )
            .map((entry) => {
              const cleanEntry = Object.fromEntries(
                Object.entries(entry as Record<string, any>)
                  .filter(
                    ([key, value]) =>
                      key.trim() !== "" &&
                      value !== null &&
                      String(value).trim() !== "",
                  )
                  .filter(([key]) =>
                    allowedData.includes(key as keyof ImportExitDataType),
                  ),
              );
              return cleanEntry;
            });

          if (validateImportData(finalData)) {
            setImportData({ data: finalData as ImportExitDataType[] });
            const employeeCodes = finalData!.map(
              (value) => value.employee_code,
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
                (e) => e.employee_code === item.employee_code,
              )?.id;

              const { employee_code, ...rest } = item;
              return {
                ...rest,
                ...(employeeId ? { employee_id: employeeId } : {}),
              };
            });

            const { conflictingIndices, error } = await getExitsConflicts({
              supabase,
              importedData: updatedData,
            });

            if (error) {
              throw error;
            }

            setHasConflict(conflictingIndices);
            setLoadNext(true);
          }
        },
        error: (error) => {
          console.error("Exit Data parsing error:", error);
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
        <ExitImportData env={env} conflictingIndices={hasConflict} />
      ) : (
        <Card className="m-4 px-40">
          <CardHeader>
            <CardTitle>Map Fields</CardTitle>
            <CardDescription>
              Map your fields with the Employee fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            {validationErrors.length > 0 && (
              <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded">
                <h4 className="text-red-700 font-medium mb-2">
                  Validation Errors:
                </h4>
                <ul className="grid grid-cols-3 gap-y-1">
                  {validationErrors.map((error, index) => (
                    <li
                      key={error.toString() + index.toString()}
                      className="text-red-600 text-sm"
                    >
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 place-content-center justify-between gap-y-8 gap-x-10 mt-5">
              {FIELD_CONFIGS.map((field) => (
                <div key={field.key} className="flex flex-col">
                  <div className="flex flex-row gap-1 pb-1">
                    <label className="text-sm text-muted-foreground capitalize">
                      {replaceUnderscore(field.key)}
                    </label>
                    <sub
                      className={cn(
                        "hidden text-primary mt-1",
                        field.required && "inline",
                      )}
                    >
                      *
                    </sub>
                  </div>
                  <Combobox
                    options={transformStringArrayIntoOptions(headerArray)}
                    value={
                      fieldMapping[field.key] ||
                      headerArray?.find((value) => {
                        return (
                          pipe(
                            replaceUnderscore,
                            replaceDash,
                          )(value?.toLowerCase()) ===
                          pipe(
                            replaceUnderscore,
                            replaceDash,
                          )(field.key?.toLowerCase())
                        );
                      }) ||
                      ""
                    }
                    onChange={(value: string) =>
                      handleMapping(field.key, value)
                    }
                    placeholder={`Select ${replaceUnderscore(field.key)}`}
                    className={errors[field.key] ? "border-red-500" : ""}
                  />
                  {errors[field.key] && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors[field.key]}
                    </span>
                  )}
                </div>
              ))}

              <div />
              <div className="flex flex-col items-end gap-2">
                {errors.general && (
                  <span className="text-red-500 text-sm">{errors.general}</span>
                )}
                <Button
                  className="w-24"
                  variant="default"
                  onClick={handleParsedData}
                >
                  Submit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

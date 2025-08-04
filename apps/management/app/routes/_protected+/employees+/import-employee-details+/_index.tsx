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
import type { ImportEmployeeDetailsHeaderSchemaObject } from "@canny_ecosystem/utils";
import type { ImportEmployeeDetailsDataType } from "@canny_ecosystem/supabase/queries";
import {
  ImportEmployeeDetailsHeaderSchema,
  ImportEmployeeDetailsDataSchema,
  transformStringArrayIntoOptions,
  replaceUnderscore,
  pipe,
  replaceDash,
} from "@canny_ecosystem/utils";
import type { z } from "zod";
import { getEmployeeDetailsConflicts } from "@canny_ecosystem/supabase/mutations";
import { EmployeeDetailsImportData } from "@/components/employees/import-export/employee-details-import-data";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { useImportStoreForEmployeeDetails } from "@/store/import";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { cn } from "@canny_ecosystem/ui/utils/cn";

type FieldConfig = {
  key: keyof z.infer<typeof ImportEmployeeDetailsHeaderSchemaObject>;
  required?: boolean;
};

const FIELD_CONFIGS: FieldConfig[] = [
  {
    key: "employee_code",
    required: true,
  },
  {
    key: "first_name",
    required: true,
  },
  {
    key: "middle_name",
  },
  {
    key: "last_name",
    required: true,
  },
  { key: "gender" },
  {
    key: "marital_status",
  },
  {
    key: "date_of_birth",
    required: true,
  },
  { key: "education" },
  { key: "is_active" },
  {
    key: "personal_email",
  },
  {
    key: "primary_mobile_number",
    required: true,
  },
  {
    key: "secondary_mobile_number",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  return json({ env, companyId });
}

export default function EmployeeDetailsImportFieldMapping() {
  const { env, companyId } = useLoaderData<typeof loader>();
  const { supabase } = useSupabase({ env });

  const { setImportData } = useImportStoreForEmployeeDetails();

  const [loadNext, setLoadNext] = useState(false);
  const [hasConflict, setHasConflict] = useState<number[]>([]);

  const location = useLocation();
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
          console.error("Employee Details Header parsing error:", error);
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

          if (matchedHeader) {
            mapping[field.key] = matchedHeader;
          }

          return mapping;
        },
        {} as Record<string, string>,
      );

      setFieldMapping(initialMapping);
    }
  }, [headerArray]);

  const validateMapping = () => {
    try {
      const mappingResult = ImportEmployeeDetailsHeaderSchema.safeParse(
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
      console.error("Employee Details Validation error:", error);
      setValidationErrors(["An unexpected error occurred during validation"]);
      return false;
    }
  };

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportEmployeeDetailsDataSchema.safeParse({ data });
      if (!result.success) {
        const formattedErrors = result.error.errors.map(
          (err) => `${err.path[2]}: ${err.message}`,
        );
        setValidationErrors(formattedErrors);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Employee Details Data validation error:", error);
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
    if (!validateMapping()) {
      return;
    }

    const swappedFieldMapping = Object.fromEntries(
      Object.entries(fieldMapping).map(([key, value]) => [value, key]),
    );

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => swappedFieldMapping[header] || header,
        complete: async (results) => {
          const allowedFields = FIELD_CONFIGS.map((field) => field.key);
          const finalData = results?.data
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
                    allowedFields.includes(
                      key as keyof ImportEmployeeDetailsDataType,
                    ),
                  )
                  .map(
                    ([key, value]) =>
                      [
                        key,
                        String(value).trim(),
                      ] as unknown as ImportEmployeeDetailsDataType[],
                  ),
              );
              return cleanEntry;
            });

          if (validateImportData(finalData)) {
            setImportData({
              data: finalData as ImportEmployeeDetailsDataType[],
            });
            const { conflictingIndices, error } =
              await getEmployeeDetailsConflicts({
                supabase,
                importedData: finalData as ImportEmployeeDetailsDataType[],
              });

            if (error) {
              throw error;
            }

            setHasConflict(conflictingIndices);
            setLoadNext(true);
          }
        },
        error: (error) => {
          console.error("Employee Details Data parsing error:", error);
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
        <EmployeeDetailsImportData
          conflictingIndices={hasConflict}
          env={env}
          companyId={companyId}
        />
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

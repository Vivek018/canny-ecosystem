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
  defaultMonth,
  defaultYear,
  ImportVehicleUsageDataSchema,
  ImportVehicleUsageHeaderSchema,
} from "@canny_ecosystem/utils";
import {
  transformStringArrayIntoOptions,
  replaceUnderscore,
  pipe,
  replaceDash,
} from "@canny_ecosystem/utils";
import type { z } from "zod";

import { useImportStoreForVehicleUsage } from "@/store/import";
import { cn } from "@canny_ecosystem/ui/utils/cn"; 
import { Label } from "@canny_ecosystem/ui/label";
import { VehicleUsageImportData } from "@/components/vehicles/usage/import-export/vehicle-usage-import-data";
import { payoutMonths } from "@canny_ecosystem/utils/constant";

type FieldConfig = {
  key: keyof z.infer<typeof ImportVehicleUsageHeaderSchema>;
  required?: boolean;
};

const FIELD_CONFIGS: FieldConfig[] = [
  {
    key: "registration_number",
    required: true,
  },
  {
    key: "kilometers",
  },
  {
    key: "fuel_in_liters",
  },
  {
    key: "fuel_amount",
  },
  {
    key: "toll_amount",
  },
  {
    key: "maintainance_amount",
  },
];

export async function loader() {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return json({ env });
}

export default function VehicleUsageFieldMapping() {
  const { env } = useLoaderData<typeof loader>();

  const { setImportData } = useImportStoreForVehicleUsage();

  const [loadNext, setLoadNext] = useState(false);

  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);

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
            (header) => header !== null && header.trim() !== ""
          );
          setHeaderArray(headers);
        },
        error: (error) => {
          console.error("Vehicle Usage Header parsing error:", error);
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
              pipe(replaceUnderscore, replaceDash)(field.key?.toLowerCase())
          );

          if (matchedHeader) {
            mapping[field.key] = matchedHeader;
          }

          return mapping;
        },
        {} as Record<string, string>
      );

      setFieldMapping(initialMapping);
    }
  }, [headerArray]);

  const validateMapping = () => {
    try {
      const mappingResult = ImportVehicleUsageHeaderSchema.safeParse(
        Object.fromEntries(
          Object.entries(fieldMapping).map(([key, value]) => [
            key,
            value || undefined,
          ])
        )
      );

      if (!mappingResult.success) {
        const formattedErrors = mappingResult.error.errors.map(
          (err) => err.message
        );
        setValidationErrors(formattedErrors);
        return false;
      }

      setValidationErrors([]);
      return true;
    } catch (error) {
      console.error("Vehicle Usage Validation error:", error);
      setValidationErrors(["An unexpected error occurred during validation"]);
      return false;
    }
  };

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportVehicleUsageDataSchema.safeParse({ data });
      if (!result.success) {
        const formattedErrors = result.error.errors.map(
          (err) => `${err.path[2]}: ${err.message}`
        );
        setValidationErrors(formattedErrors);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Vehicle usage Data validation error:", error);
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
      Object.entries(fieldMapping).map(([key, value]) => [value, key])
    );

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => swappedFieldMapping[header] || header,
        complete: async (results) => {
          const allowedFields = FIELD_CONFIGS.map((field) => field.key);

          const finalData = results.data
            .filter((entry) =>
              Object.values(entry!).some((value) => String(value).trim() !== "")
            )
            .map((entry) => {
              const cleanEntry = Object.fromEntries(
                Object.entries(entry as Record<string, any>)
                  .filter(
                    ([key, value]) =>
                      key.trim() !== "" &&
                      value !== null &&
                      String(value).trim() !== ""
                  )
                  .filter(([key]) => allowedFields.includes(key as any))
                  .map(([key, value]) => [key, String(value).trim()])
              );

              return { ...cleanEntry, month, year };
            });

          if (validateImportData(finalData)) {
            setImportData({
              data: finalData as any[],
            });

            setLoadNext(true);
          }
        },

        error: (error) => {
          console.error("Vehicle usage Data parsing error:", error);
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
        <VehicleUsageImportData env={env} />
      ) : (
        <Card className="m-4 px-40">
          <CardHeader>
            <CardTitle>Map Fields</CardTitle>
            <CardDescription>
              Map your fields with the vehicle usage fields
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
            <div className="grid grid-cols-2 gap-8 mb-4">
              <div className="flex  flex-col gap-1">
                <Label className="text-sm font-medium">Month</Label>

                <Combobox
                  options={payoutMonths}
                  placeholder="Select Payroll Month"
                  value={month}
                  onChange={(value: string) => {
                    setMonth(Number(value));
                  }}
                />
              </div>

              <div className=" flex flex-col gap-1">
                <Label className="text-sm font-medium">Year</Label>
                <Combobox
                  options={transformStringArrayIntoOptions([
                    `${defaultYear - 2}`,
                    `${defaultYear - 1}`,
                    `${defaultYear}`,
                  ] as unknown as string[])}
                  placeholder="Select Payroll Year"
                  value={year}
                  onChange={(value: string) => {
                    setYear(Number(value));
                  }}
                />
              </div>
            </div>
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
                        field.required && "inline"
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
                            replaceDash
                          )(value?.toLowerCase()) ===
                          pipe(
                            replaceUnderscore,
                            replaceDash
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

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
  currentDate,
  ImportReimbursementDataSchema,
  ImportReimbursementHeaderSchema,
  reimbursementStatusArray,
  reimbursementTypeArray,
} from "@canny_ecosystem/utils";
import {
  getUsersByCompanyId,
  type ImportReimbursementDataType,
} from "@canny_ecosystem/supabase/queries";
import {
  transformStringArrayIntoOptions,
  replaceUnderscore,
  pipe,
  replaceDash,
} from "@canny_ecosystem/utils";
import type { z } from "zod";

import { useImportStoreForReimbursement } from "@/store/import";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { ReimbursementImportData } from "@/components/reimbursements/import-export/reimbursement-import-data";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Label } from "@canny_ecosystem/ui/label";
import { Input } from "@canny_ecosystem/ui/input";

type FieldConfig = {
  key: keyof z.infer<typeof ImportReimbursementHeaderSchema>;
  required?: boolean;
};

const FIELD_CONFIGS: FieldConfig[] = [
  {
    key: "employee_code",
    required: true,
  },
  {
    key: "amount",
    required: true,
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: userData, error: userError } = await getUsersByCompanyId({
    supabase,
    companyId,
  });
  if (userError || !userData) {
    throw userError;
  }

  const userOptions = userData.map((userData) => ({
    label: userData.email?.toLowerCase() ?? "",
    value: userData.id,
  }));
  return json({ env, companyId, userOptions });
}

export default function ReimbursementFieldMapping() {
  const { env, companyId, userOptions } = useLoaderData<typeof loader>();

  const { setImportData } = useImportStoreForReimbursement();

  const [loadNext, setLoadNext] = useState(false);

  const [type, setType] = useState(reimbursementTypeArray[0] as string);
  const [note, setNote] = useState("");
  const [approver, setApprover] = useState("");
  const [status, setStatus] = useState(reimbursementStatusArray[0] as string);
  const [date, setDate] = useState(currentDate);

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
          console.error("Reimbursement Header parsing error:", error);
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
      const mappingResult = ImportReimbursementHeaderSchema.safeParse(
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
      console.error("Reimbursement Validation error:", error);
      setValidationErrors(["An unexpected error occurred during validation"]);
      return false;
    }
  };

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportReimbursementDataSchema.safeParse({ data });
      if (!result.success) {
        const formattedErrors = result.error.errors.map(
          (err) => `${err.path[2]}: ${err.message}`
        );
        setValidationErrors(formattedErrors);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Reimbursement Data validation error:", error);
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
                  .filter(([key]) =>
                    allowedFields.includes(
                      key as keyof ImportReimbursementDataType
                    )
                  )
                  .map(([key, value]) => [key, String(value).trim()])
              );

              return {
                ...cleanEntry,
                note: note,
                type: type,
                status: status,
                submitted_date: date,
                user_id: approver,
              };
            });

          if (validateImportData(finalData)) {
            setImportData({
              data: finalData as any[],
            });

            setLoadNext(true);
          }
        },

        error: (error) => {
          console.error("Reimbursement Data parsing error:", error);
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
        <ReimbursementImportData env={env} companyId={companyId} />
      ) : (
        <Card className="m-4 px-40">
          <CardHeader>
            <CardTitle>Map Fields</CardTitle>
            <CardDescription>
              Map your fields with the Reimbursements fields
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
                <Label className="text-sm font-medium">Type</Label>

                <Combobox
                  options={transformStringArrayIntoOptions(
                    Array.from(reimbursementTypeArray)
                  )}
                  placeholder="Select Type"
                  value={type}
                  onChange={(value: string) => {
                    setType(value);
                  }}
                />
              </div>

              <div className=" flex flex-col gap-1">
                <Label className="text-sm font-medium">Note</Label>
                <Input
                  type="text"
                  placeholder="Enter the title here"
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-4">
              <div className=" flex flex-col gap-1">
                <Label className="text-sm font-medium">Submitted Date</Label>
                <Input
                  type="date"
                  defaultValue={currentDate}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="flex  flex-col gap-1">
                <Label className="text-sm font-medium">Status</Label>
                <Combobox
                  options={transformStringArrayIntoOptions(
                    Array.from(reimbursementStatusArray)
                  )}
                  placeholder="Select Status"
                  value={status}
                  onChange={(value: string) => {
                    setStatus(value);
                  }}
                />
              </div>
            </div>
            <div className="mb-10 flex flex-col gap-1">
              <Label className="text-sm font-medium">Approver</Label>
              <Combobox
                options={userOptions}
                placeholder="Select User"
                value={approver}
                onChange={(value: string) => {
                  setApprover(value);
                }}
              />
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

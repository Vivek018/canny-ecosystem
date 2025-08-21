import { useState, useEffect, useRef } from "react";
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
import type { ImportSalaryPayrollHeaderSchemaObject } from "@canny_ecosystem/utils";
import {
  getProjectsByCompanyId,
  getSiteNamesByCompanyId,
  type ImportSalaryPayrollDataType,
} from "@canny_ecosystem/supabase/queries";
import {
  transformStringArrayIntoOptions,
  replaceUnderscore,
  pipe,
  replaceDash,
  ImportSalaryPayrollHeaderSchema,
  ImportSalaryPayrollDataSchema,
  componentTypeArray,
  defaultYear,
  defaultMonth,
} from "@canny_ecosystem/utils";
import type { z } from "zod";
import { useImportStoreForSalaryPayroll } from "@/store/import";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { SalaryPayrollImportData } from "@/components/payroll/import-export/salary-payroll-import-data";
import { Icon } from "@canny_ecosystem/ui/icon";
import { payoutMonths } from "@canny_ecosystem/utils/constant";
import { Input } from "@canny_ecosystem/ui/input";
import { Label } from "@canny_ecosystem/ui/label";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export type FieldConfig = {
  key: string;
  required?: boolean;
  type?: string;
};

const FIELD_CONFIGS: FieldConfig[] = [
  {
    key: "employee_code",
    required: true,
  },
  {
    key: "uan_number",
    required: false,
  },
  {
    key: "esic_number",
    required: false,
  },
  {
    key: "present_days",
    required: true,
  },
  {
    key: "site",
  },
  {
    key: "department",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data: projects } = await getProjectsByCompanyId({
    supabase,
    companyId,
  });

  const projectOptions = projects?.map((project) => ({
    label: project?.name,
    value: project?.id,
  }));

  const { data: allSites } = await getSiteNamesByCompanyId({
    companyId,
    supabase,
  });
  const siteOptions = allSites?.map((sites) => ({
    label: sites?.name,
    value: sites?.id,
    pseudoLabel: sites?.projects?.name,
  }));

  return json({ env, siteOptions, projectOptions, companyId });
}

export default function PayrollImportFieldMapping() {
  const today = new Date();
  const { env, projectOptions, siteOptions, companyId } =
    useLoaderData<typeof loader>();
  const { setImportData } = useImportStoreForSalaryPayroll();
  const [addField, setAddField] = useState("");
  const [addFieldValue, setAddFieldValue] = useState("");
  const [addFieldValueType, setAddFieldValueType] = useState("");
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [project, setProject] = useState("");
  const [site, setSite] = useState("");

  const [title, setTitle] = useState("");
  const [runDate, setRunDate] = useState(today.toISOString().split("T")[0]);
  const [open, setOpen] = useState(false);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([
    ...FIELD_CONFIGS,
    {
      key: "working_days",
    },
    {
      key: "working_hours",
    },
    {
      key: "overtime_hours",
    },
    {
      key: "absent_days",
    },
    {
      key: "paid_holidays",
    },
    {
      key: "paid_leaves",
    },
    {
      key: "casual_leaves",
    },
    {
      key: "BASIC",
      type: "earning",
    },
    {
      key: "DA",
      type: "earning",
    },
    {
      key: "HRA",
      type: "earning",
    },
    {
      key: "LTA",
      type: "earning",
    },
    {
      key: "OT Amount",
      type: "earning",
    },
    {
      key: "Bonus",
      type: "earning",
    },
    {
      key: "Leave Salary",
      type: "earning",
    },
    {
      key: "PF",
      type: "deduction",
    },
    {
      key: "ESIC",
      type: "deduction",
    },
    {
      key: "PT",
      type: "deduction",
    },
  ]);

  const [loadNext, setLoadNext] = useState(false);
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
          console.error("Payroll Header parsing error:", error);
          setErrors((prev) => ({ ...prev, parsing: "Error parsing headers" }));
        },
      });
    }
  }, [file]);

  useEffect(() => {
    if (headerArray.length > 0) {
      const initialMapping = fieldConfigs.reduce(
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

  const availableHeaders = headerArray.filter(
    (header) =>
      !fieldConfigs.some(
        (config) =>
          pipe(replaceUnderscore, replaceDash)(config?.key.toLowerCase()) ===
          pipe(replaceUnderscore, replaceDash)(header.toLowerCase()),
      ),
  );

  const validateMapping = () => {
    try {
      const mappingResult = ImportSalaryPayrollHeaderSchema.safeParse(
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
      console.error("Payroll Validation error:", error);
      setValidationErrors(["An unexpected error occurred during validation"]);
      return false;
    }
  };

  const validateImportData = (data: any[]) => {
    try {
      const result = ImportSalaryPayrollDataSchema.safeParse({ title, data });

      if (!result.success) {
        const formattedErrors = result.error.errors.map(
          (err) => `${err.path[0]}: ${err.message}`,
        );

        setValidationErrors(formattedErrors);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Payroll Data validation error:", error);
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
          const allowedFields = fieldConfigs.map((field) => field.key);
          const fieldTypes = fieldConfigs.map((field) => ({
            key: field.key,
            type: field.type,
          }));

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
                    allowedFields
                      .map((field) => field.toLowerCase())
                      .includes(key.toLowerCase()),
                  )
                  .map(([key, value]) => [key, String(value).trim()]),
              );
              return cleanEntry;
            });

          if (validateImportData(finalData)) {
            const fieldTypeMap: Record<string, string | undefined> = {};
            for (const { key, type } of fieldTypes) {
              fieldTypeMap[key.toLowerCase()] = type;
            }
            const finalImport = finalData.map((row) => {
              const transformedRow: Record<string, any> = {};

              for (const key in row) {
                const type = fieldTypeMap[key.toLowerCase()];
                if (type) {
                  transformedRow[key] = {
                    amount: Number.isNaN(Number(row[key]))
                      ? row[key]
                      : Number.parseFloat(row[key]),
                    type,
                  };
                } else {
                  transformedRow[key] = row[key];
                }
              }
              transformedRow.month = month;
              transformedRow.year = year;
              transformedRow.run_date = runDate;
              return transformedRow;
            });

            setImportData({
              title,
              site_id: site,
              project_id: project,
              data: finalImport as ImportSalaryPayrollDataType[],
            });

            setLoadNext(true);
          }
        },
        error: (error) => {
          console.error("Payroll Data parsing error:", error);
          setErrors((prev) => ({
            ...prev,
            parsing: "Error parsing file data",
          }));
        },
      });
    }
  };

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (dialogRef.current?.contains(target)) return;

      if (
        target.closest("[cmdk-root]") ||
        target.closest("[role='listbox']") ||
        target.closest(".popover-content")
      ) {
        return;
      }

      setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);
  return (
    <section className="py-4 ">
      {loadNext ? (
        <SalaryPayrollImportData
          env={env}
          fieldConfigs={fieldConfigs}
          companyId={companyId}
        />
      ) : (
        <Card className="m-4 px-40">
          <CardHeader>
            <CardTitle>Map Fields</CardTitle>
            <CardDescription>
              Map your fields with the Payroll fields
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
            <div className="mb-6">
              <Label className="text-sm font-medium">Run Date</Label>
              <Input
                type="date"
                placeholder="Enter the Run Date"
                value={runDate}
                onChange={(e) => setRunDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-8 mb-4">
              <div className="mb-8 flex flex-col gap-1">
                <Label className="text-sm font-medium">Project</Label>
                <Combobox
                  options={projectOptions ?? []}
                  placeholder="Select Project"
                  value={project}
                  onChange={(value: string) => {
                    setProject(value);
                  }}
                />
              </div>
              <div className="mb-8 flex flex-col gap-1">
                <Label className="text-sm font-medium">Site</Label>
                <Combobox
                  options={siteOptions ?? []}
                  placeholder="Select Site"
                  value={site}
                  onChange={(value: string) => {
                    setSite(value);
                  }}
                />
              </div>
            </div>
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

            <div className="mb-8 flex flex-col gap-1">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                className=""
                placeholder="Enter the title here"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 place-content-center justify-between gap-y-8 gap-x-10 mt-5 mb-10">
              {fieldConfigs.map((field) => (
                <div key={field.key} className="flex flex-col relative">
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex gap-1">
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
                    <Button
                      variant={"ghost"}
                      onClick={() =>
                        setFieldConfigs((prev) =>
                          prev.filter((f) => f.key !== field.key),
                        )
                      }
                      className="p-0 h-0 text-destructive text-xs font-extrabold"
                      title="Remove field"
                    >
                      ✕
                    </Button>
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
            </div>

            <Button
              variant={"primary-outline"}
              className="w-full gap-2"
              onClick={() => {
                setOpen(true);
              }}
            >
              <Icon
                name="plus"
                size="lg"
                className="shrink-0 flex justify-center items-center"
              />
              Add Salary Entry
            </Button>
            <div
              className={cn(
                "fixed inset-0 z-50 bg-black/80",
                !open && "hidden",
              )}
            >
              <div
                ref={dialogRef}
                className={cn(
                  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-lg font-semibold">Add a Field</h1>
                  <button type="button" onClick={() => setOpen(false)}>
                    <Icon name="cross" size="sm" />
                  </button>
                </div>
                <Combobox
                  options={transformStringArrayIntoOptions(availableHeaders)}
                  placeholder="Select Mapping Field"
                  value={addFieldValue}
                  onChange={(value: string) => {
                    setAddField(value);
                    setAddFieldValue(value);
                  }}
                />
                <Combobox
                  options={transformStringArrayIntoOptions(
                    componentTypeArray as unknown as string[],
                  )}
                  placeholder="Select Field Type"
                  value={addFieldValueType}
                  onChange={(value: string) => {
                    setAddFieldValueType(value);
                  }}
                />
                <div className="w-full flex justify-end items-center mt-6 gap-4">
                  <Button
                    variant="muted"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className=""
                    onClick={() => {
                      setFieldConfigs((prev) => [
                        ...prev,
                        {
                          key: addField as keyof z.infer<
                            typeof ImportSalaryPayrollHeaderSchemaObject
                          >,
                          required: false,
                          type: addFieldValueType,
                        },
                      ]);
                      handleMapping(addFieldValue, addFieldValue);
                      setOpen(false);
                    }}
                  >
                    Set
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col items-end gap-2">
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
          </CardContent>
        </Card>
      )}
    </section>
  );
}

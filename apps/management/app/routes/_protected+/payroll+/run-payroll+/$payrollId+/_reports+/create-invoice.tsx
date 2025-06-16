import { FormButtons } from "@/components/form/form-buttons";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { addOrUpdateInvoiceWithProof } from "@canny_ecosystem/supabase/media";
import { createInvoice } from "@canny_ecosystem/supabase/mutations";
import {
  getCannyCompanyIdByName,
  getLocationsForSelectByCompanyId,
  getPayrollById,
  getPayrollEntriesByPayrollId,
  getRelationshipsByParentAndChildCompanyId,
  getSalaryEntriesByPayrollId,
  type PayrollEntriesWithEmployee,
  type SalaryEntriesWithEmployee,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { InvoiceDatabaseInsert } from "@canny_ecosystem/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  CheckboxField,
  Field,
  RangeField,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  getInitialValueFromZod,
  invoiceReimbursementTypeArray,
  InvoiceSchema,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
  SIZE_1MB,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  Form,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { createMemoryUploadHandler } from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";
import { useEffect, useState } from "react";
import { UPDATE_INVOICE_TAG } from "../../../invoices+/$invoiceId.update-invoice";
import { cn } from "@canny_ecosystem/ui/utils/cn";

const ADD_INVOICE_TAG = "Create-Invoice";

export const CANNY_NAME = "Canny Management Services";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const payrollId = params.payrollId as string;
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data: cannyData, error } = await getCannyCompanyIdByName({
    name: CANNY_NAME,
    supabase,
  });
  if (error) {
    throw new Error("Error fetching company ID");
  }

  let companyRelations = [] as any;
  if (cannyData?.id) {
    const { data } = await getRelationshipsByParentAndChildCompanyId({
      childCompanyId: cannyData?.id,
      parentCompanyId: companyId,
      supabase,
    });
    companyRelations = (data ?? []) as unknown as any;
  }

  const { data: payroll } = await getPayrollById({ payrollId, supabase });
  const { data: companyLocations } = await getLocationsForSelectByCompanyId({
    companyId,
    supabase,
  });
  let salaryData = [] as SalaryEntriesWithEmployee[] | null;
  let payrollData = [] as PayrollEntriesWithEmployee[] | null;
  if (payroll?.payroll_type === "salary") {
    const { data } = await getSalaryEntriesByPayrollId({
      supabase,
      payrollId,
    });
    salaryData = data;
  }
  if (
    payroll?.payroll_type === "exit" ||
    payroll?.payroll_type === "reimbursement"
  ) {
    const { data } = await getPayrollEntriesByPayrollId({
      supabase,
      payrollId,
    });
    payrollData = data;
  }

  const companyLocationArray = companyLocations?.map((location) => ({
    label: location?.name,
    value: location?.id,
  }));
  return {
    payroll,
    salaryData,
    payrollData,
    companyRelations,
    companyLocationArray,
    payrollId,
    companyId,
  };
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    `${cacheKeyPrefix.payroll_invoice}${args.params.payrollId}`,
    args
  );
}

clientLoader.hydrate = true;

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const payrollId = params.payrollId as string;
  const { supabase } = getSupabaseWithHeaders({ request });
  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_1MB })
    );

    const submission = parseWithZod(formData, {
      schema: InvoiceSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }
    if (submission.value.include_proof) {
      if (submission.value.proof) {
        const { error, status } = await addOrUpdateInvoiceWithProof({
          invoiceData: submission.value as InvoiceDatabaseInsert,
          payrollId,
          proof: submission.value.proof as File,
          supabase,
          route: "add",
        });

        if (isGoodStatus(status!)) {
          return json({
            status: "success",
            message: "Invoice created successfully",
            error: null,
          });
        }

        return json({
          status: "error",
          message: "Error creating Invoice",
          error,
        });
      }
    }

    const { status, error } = await createInvoice({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Invoice created successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Error creating Invoice",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export default function CreateInvoice({
  updateValues,
  locationArrayFromUpdate,
  companyRelationsFromUpdate,
}: {
  updateValues?: InvoiceDatabaseInsert;
  locationArrayFromUpdate: any[];
  companyRelationsFromUpdate: any;
}) {
  const {
    companyId,
    payroll,
    payrollData,
    salaryData,
    payrollId,
    companyLocationArray,
    companyRelations,
  } = useLoaderData<typeof loader>();

  const relations = companyRelationsFromUpdate ?? companyRelations;

  const type = payroll?.payroll_type ?? updateValues?.payroll_type;

  function transformPayrollData(employees: any[], payrollType: string) {
    const total = employees.reduce(
      (sum, entry) => sum + (entry.amount || 0),
      0
    );

    return [
      {
        field: payrollType.toUpperCase(),
        amount: Number(total.toFixed(2)),
      },
    ];
  }

  function transformSalaryData(employees: any) {
    const fieldTotals: Record<string, { rawAmount: number; type: string }> = {};

    for (const emp of employees) {
      for (const entry of emp.salary_entries) {
        const field = entry.field_name;
        if (!fieldTotals[field]) {
          fieldTotals[field] = { rawAmount: 0, type: entry.type };
        }
        fieldTotals[field].rawAmount += entry.amount;
      }
    }
    const basicAmount = fieldTotals.BASIC?.rawAmount ?? 0;

    return Object.entries(fieldTotals).map(([field, data]) => {
      let amount = data.rawAmount;

      if (field === "PF" || field === "EPF") {
        amount = (basicAmount * 13) / 100;
      } else if (field === "ESIC" || field === "ESI") {
        amount = (amount * 3.25) / 0.75;
      }

      return {
        field,
        amount: Number(amount.toFixed(2)),
        type: data.type,
      };
    });
  }

  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const INVOICE_TAG = updateValues ? UPDATE_INVOICE_TAG : ADD_INVOICE_TAG;

  const initialValues = updateValues ?? getInitialValueFromZod(InvoiceSchema);

  const [form, fields] = useForm({
    id: INVOICE_TAG,
    constraint: getZodConstraint(InvoiceSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: InvoiceSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      payroll_id: initialValues.payroll_id ?? payrollId,
      company_id: initialValues.company_id ?? companyId,
      payroll_data: updateValues
        ? typeof updateValues?.payroll_data === "string"
          ? JSON.parse(updateValues.payroll_data as string)
          : updateValues.payroll_data
        : payroll?.payroll_type === "salary"
        ? transformSalaryData(salaryData)
        : transformPayrollData(payrollData as any[], payroll?.payroll_type!),
      payroll_type: updateValues?.payroll_type ?? type,
      proof: undefined,
      invoice_type:
        updateValues?.invoice_type ??
        (type === "exit" || type === "salary" ? type : "expenses"),
    },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.payroll_invoice);
      toast({
        title: "Success",
        description: actionData.message || "Invoice created",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData.message || "Invoice create failed",
        variant: "destructive",
      });
    }

    navigate("/payroll/invoices", {
      replace: true,
    });
  }, [actionData]);

  return (
    <section className="p-4">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">
                {replaceDash(INVOICE_TAG)}
              </CardTitle>
              <CardDescription className="lowercase">
                {`${replaceDash(INVOICE_TAG)} by filling this form`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <input
                {...getInputProps(fields.payroll_id, { type: "hidden" })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  inputProps={{
                    ...getInputProps(fields.invoice_number, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.invoice_number.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.invoice_number.name),
                  }}
                  errors={fields.invoice_number.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.date, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(fields.date.name)}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.date.name),
                  }}
                  errors={fields.date.errors}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  inputProps={{
                    ...getInputProps(fields.subject, { type: "text" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.subject.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.subject.name),
                  }}
                  errors={fields.subject.errors}
                />
                <SearchableSelectField
                  className="capitalize"
                  options={companyLocationArray ?? locationArrayFromUpdate}
                  inputProps={{
                    ...getInputProps(fields.company_address_id, {
                      type: "text",
                    }),
                    defaultValue: String(
                      fields.company_address_id.initialValue
                    ),
                  }}
                  placeholder={"Select Company Location"}
                  labelProps={{
                    children: "Company Location",
                  }}
                  errors={fields.company_address_id.errors}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <SearchableSelectField
                  className="capitalize"
                  options={transformStringArrayIntoOptions([
                    "salary",
                    "exit",
                    "reimbursement",
                  ])}
                  inputProps={{
                    ...getInputProps(fields.payroll_type, {
                      type: "text",
                    }),
                    defaultValue: String(fields.payroll_type.initialValue),
                  }}
                  placeholder={"Select Payroll Type"}
                  labelProps={{
                    children: "Payroll Type",
                  }}
                  errors={fields.payroll_type.errors}
                />

                <SearchableSelectField
                  className="capitalize"
                  options={transformStringArrayIntoOptions([
                    "salary",
                    "exit",
                    ...invoiceReimbursementTypeArray,
                  ])}
                  inputProps={{
                    ...getInputProps(fields.invoice_type, {
                      type: "text",
                    }),
                    defaultValue: String(fields.invoice_type.initialValue),
                  }}
                  placeholder={"Select Invoice Type"}
                  labelProps={{
                    children: "Invoice Type",
                  }}
                  errors={fields.invoice_type.errors}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CheckboxField
                  buttonProps={getInputProps(fields.include_charge, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: `Is Charge Included? (${
                      type === "salary"
                        ? `${relations?.terms?.service_charge}% of ${relations.terms?.include_service_charge}`
                        : `${relations.terms?.reimbursement_charge}%`
                    })`,
                  }}
                />
                <CheckboxField
                  buttonProps={getInputProps(fields.include_cgst, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Is Cgst Included? (9%)",
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 my-5">
                <CheckboxField
                  buttonProps={getInputProps(fields.include_sgst, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Is Sgst Included? (9%)",
                  }}
                />
                <CheckboxField
                  buttonProps={getInputProps(fields.include_igst, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Is Igst Included? (18%)",
                  }}
                />
              </div>
              <CheckboxField
                buttonProps={getInputProps(fields.include_proof, {
                  type: "checkbox",
                })}
                labelProps={{
                  children: "Are Proof Needed?",
                }}
              />
              <Field
                className="my-2"
                inputProps={{
                  ...getInputProps(fields.proof, { type: "file" }),
                  placeholder: `Enter ${replaceUnderscore(fields.proof.name)}`,
                }}
                labelProps={{
                  children: replaceUnderscore(fields.proof.name),
                }}
                errors={fields.proof.errors}
              />
              <div className="grid grid-cols-2 gap-4 my-5">
                <CheckboxField
                  buttonProps={getInputProps(fields.is_paid, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Is this paid?",
                  }}
                />
                <CheckboxField
                  buttonProps={getInputProps(fields.include_header, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Include header in Invoice?",
                  }}
                />
              </div>
              <RangeField
                key={resetKey}
                labelProps={{ children: "Payroll salary" }}
                inputProps={{
                  ...getInputProps(fields.payroll_data, {
                    type: "hidden",
                  }),
                  defaultValue: JSON.stringify(
                    fields.payroll_data.initialValue ??
                      fields.payroll_data.value
                  ),
                }}
                fields={[
                  {
                    key: "field",
                    type: "text",
                    placeholder: "Payroll Fields",
                  },
                  { key: "amount", type: "number", placeholder: "Amount" },
                ]}
                errors={fields.payroll_data.errors}
              />
              <p
                className={cn(
                  "text-muted-foreground hidden",
                  (updateValues?.payroll_type ??
                    payroll?.payroll_type === "salary") &&
                    "flex"
                )}
              >
                Note : As Esic values are not fixed and cant be calculated,
                kindly edit manualy above
              </p>
            </CardContent>
            <FormButtons
              form={form}
              setResetKey={setResetKey}
              isSingle={true}
            />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}

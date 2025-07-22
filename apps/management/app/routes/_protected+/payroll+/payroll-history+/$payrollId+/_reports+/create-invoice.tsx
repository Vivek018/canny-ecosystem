import { FormButtons } from "@/components/form/form-buttons";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { addOrUpdateInvoiceWithProof } from "@canny_ecosystem/supabase/media";
import { createInvoice } from "@canny_ecosystem/supabase/mutations";
import {
  getCannyCompanyIdByName,
  getLocationsForSelectByCompanyId,
  getRelationshipsByParentAndChildCompanyId,
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
  InvoiceSchema,
  isGoodStatus,
  replaceDash,
  replaceUnderscore,
  roundToNearest,
  SIZE_10MB,
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
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSalaryEntriesStore } from "@/store/salary-entries";

const ADD_INVOICE_TAG = "Create-Invoice";

export const CANNY_NAME = "Canny Management Services";

export async function loader({ request }: LoaderFunctionArgs) {
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

  const { data: companyLocations } = await getLocationsForSelectByCompanyId({
    companyId,
    supabase,
  });

  const companyLocationArray = companyLocations?.map((location) => ({
    label: location?.name,
    value: location?.id,
  }));

  return {
    companyRelations,
    companyLocationArray,
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
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  try {
    const formData = await parseMultipartFormData(
      request,
      createMemoryUploadHandler({ maxPartSize: SIZE_10MB })
    );
    const selectedRowData = formData.get("selected_rows") as string;
    const selectedSalaryEntriesData = JSON.parse(selectedRowData || "[]");
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
          proof: submission.value.proof as File,
          supabase,
          route: "add",
          selectedSalaryEntriesData,
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

    const { data, status, error } = await createInvoice({
      supabase,
      data: submission.value,
    });

    if (data?.id) {
      const updatedSalaryEntries = (
        selectedSalaryEntriesData as Array<any>
      ).map((salaryEntry) => ({
        id: salaryEntry.salary_entries.id,
        invoice_id: data.id!,
      }));

      for (const entry of updatedSalaryEntries) {
        const { id, invoice_id } = entry;
        const { error } = await supabase
          .from("salary_entries")
          .update({ invoice_id })
          .eq("id", id);

        if (error) {
          return json({
            status: "error",
            message: "Error udating Salary Entry",
            error,
          });
        }
      }
      return json({
        status: "success",
        message: "Invoice created successfully",
        error: null,
      });
    }
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
  const { companyId, companyLocationArray, companyRelations } =
    useLoaderData<typeof loader>();

  const { selectedRows } = useSalaryEntriesStore();

  const relations = companyRelationsFromUpdate ?? companyRelations;

  function transformSalaryData(employees: any) {
    const fieldTotals: Record<string, { rawAmount: number; type: string }> = {};

    for (const emp of employees) {
      for (const entry of emp.salary_entries.salary_field_values) {
        const field = entry.payroll_fields.name;
        if (!fieldTotals[field]) {
          fieldTotals[field] = {
            rawAmount: 0,
            type: entry.payroll_fields.type,
          };
        }
        fieldTotals[field].rawAmount += entry.amount;
      }
    }
    const basicAmount = fieldTotals.BASIC?.rawAmount ?? 0;

    return Object.entries(fieldTotals).map(([field, data]) => {
      let amount = data.rawAmount;

      if (field.trim() === "PF" || field.trim() === "EPF") {
        amount = (basicAmount * 13) / 100;
      } else if (field.trim() === "ESIC" || field.trim() === "ESI") {
        amount = (amount * 3.25) / 0.75;
      }

      return {
        field,
        amount: roundToNearest(Number(amount)),
        type: data.type,
      };
    });
  }

  const actionData = useActionData<typeof action>();
  const [resetKey, setResetKey] = useState(Date.now());

  const INVOICE_TAG = updateValues ? "Update-Invoice" : ADD_INVOICE_TAG;

  const initialValues = updateValues ?? getInitialValueFromZod(InvoiceSchema);
  const [form, fields] = useForm({
    id: "invoice",
    constraint: getZodConstraint(InvoiceSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: InvoiceSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      company_id: initialValues.company_id ?? companyId,
      payroll_data: updateValues
        ? typeof updateValues?.payroll_data === "string"
          ? JSON.parse(updateValues.payroll_data as string)
          : updateValues.payroll_data
        : transformSalaryData(selectedRows),
      type: updateValues?.type ?? "salary",
      proof: undefined,
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
        description: actionData.message ?? "Invoice created",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData.error ?? "Invoice create failed",
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
              <input
                type="hidden"
                name="selected_rows"
                value={JSON.stringify(selectedRows)}
              />
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
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
                    ...getInputProps(fields.type, {
                      type: "text",
                    }),
                    defaultValue: String(fields.type.initialValue),
                  }}
                  placeholder={"Select Type"}
                  labelProps={{
                    children: "Type",
                  }}
                  errors={fields.type.errors}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CheckboxField
                  buttonProps={getInputProps(fields.include_charge, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: `Is Charge Included? (${`${relations?.terms?.service_charge}% of ${relations.terms?.include_service_charge}`})`,
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
                <Field
                  inputProps={{
                    ...getInputProps(fields.paid_date, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(
                      fields.paid_date.name
                    )}`,
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.paid_date.name),
                  }}
                  errors={fields.paid_date.errors}
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
              <p className={cn("text-muted-foreground tracking-wide hidden")}>
                Note : All default values are system generated, Please verify
                them manually before submitting.
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

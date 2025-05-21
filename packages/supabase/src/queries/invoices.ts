import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  InferredType,
  InvoiceDatabaseRow,
  LocationDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export type InvoiceDataType = Pick<
  InvoiceDatabaseRow,
  | "invoice_number"
  | "date"
  | "subject"
  | "company_address_id"
  | "payroll_data"
  | "payroll_type"
  | "invoice_type"
  | "payroll_id"
  | "include_charge"
  | "include_cgst"
  | "include_sgst"
  | "include_igst"
  | "is_paid"
  | "company_id"
  | "id"
  | "include_proof"
  | "proof"
> & {
  company_locations: Pick<LocationDatabaseRow, "id" | "name">;
};

export async function getInvoiceProofUrlByPayrollIdAndDocumentName({
  supabase,
  payrollId,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
  documentName: string;
}) {
  const columns = ["proof"] as const;

  const { data, error } = await supabase
    .from("invoice")
    .select(columns.join(","))
    .eq("payroll_id", payrollId)
    .eq("invoice_number", documentName)
    .maybeSingle<InvoiceDatabaseRow>();

  if (error)
    console.error("getInvoiceProofUrlBypayrollIdAndDocumentName Error", error);

  return { data, error };
}

export type InvoiceFilters = {
  date_start?: string | undefined | null;
  date_end?: string | undefined | null;
  company_location?: string | undefined | null;
  payroll_type?: string | undefined | null;
  invoice_type?: string | undefined | null;
  service_charge?: string | undefined | null;
  paid?: string | undefined | null;
};

export async function getInvoicesByCompanyId({
  supabase,
  companyId,
  params,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  params: {
    to: number;
    from: number;
    searchQuery?: string;
    filters?: InvoiceFilters | null;
  };
}) {
  const { from, to, filters, searchQuery } = params;
  const {
    date_start,
    date_end,
    company_location,
    payroll_type,
    invoice_type,
    service_charge,
    paid,
  } = filters ?? {};

  const columns = [
    "id",
    "subject",
    "invoice_number",
    "date",
    "company_address_id",
    "payroll_id",
    "payroll_data",
    "include_charge",
    "include_cgst",
    "include_sgst",
    "include_igst",
    "proof",
    "include_proof",
    "is_paid",
    "payroll_type",
    "invoice_type",
    "company_id",
    "created_at",
  ] as const;

  const query = supabase
    .from("invoice")
    .select(
      `${columns.join(",")},company_locations!${
        company_location ? "inner" : "left"
      }(id,name)`
    )
    .eq("company_id", companyId);

  if (searchQuery) {
    query.or(
      `invoice_number.ilike.*${searchQuery}*,subject.ilike.*${searchQuery}*`
    );
  }
  const dateFilters = [{ field: "date", start: date_start, end: date_end }];
  for (const { field, start, end } of dateFilters) {
    if (start) query.gte(field, formatUTCDate(start));
    if (end) query.lte(field, formatUTCDate(end));
  }

  if (company_location) {
    query.eq("company_locations.name", company_location);
  }
  if (invoice_type) {
    query.eq("invoice_type", invoice_type);
  }
  if (payroll_type) {
    query.eq("payroll_type", payroll_type);
  }
  if (service_charge) {
    query.eq("include_charge", service_charge);
  }
  if (paid) {
    query.eq("is_paid", paid);
  }
  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("getInvoicesByCompanyId Error", error);
  }

  return {
    data,
    meta: { count: count },
    error,
  };
}
export async function getInvoiceById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "subject",
    "invoice_number",
    "date",
    "company_address_id",
    "payroll_id",
    "payroll_data",
    "include_charge",
    "include_cgst",
    "include_sgst",
    "include_igst",
    "include_proof",
    "include_header",
    "is_paid",
    "proof",
    "payroll_type",
    "invoice_type",
    "created_at",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("invoice")
    .select(`${columns.join(",")}`)
    .eq("id", id)
    .single<InferredType<InvoiceDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getInvoiceByCompanyId Error", error);
  }

  return { data, error };
}

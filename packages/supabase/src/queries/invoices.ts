import type {
  InferredType,
  InvoiceDatabaseRow,
  TypedSupabaseClient,
} from "../types";

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

export async function getInvoicesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  page?: number;
  limit?: number;
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
    "proof",
    "include_proof",
    "is_paid",
    "payroll_type",
    "invoice_type",
    "company_id",
    "created_at",
  ] as const;

  const { data, error } = await supabase
    .from("invoice")
    .select(`${columns.join(",")}`)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .returns<InvoiceDatabaseRow[]>();

  if (error) {
    console.error("getInvoiceByCompanyId Error", error);
  }

  return { data, error };
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

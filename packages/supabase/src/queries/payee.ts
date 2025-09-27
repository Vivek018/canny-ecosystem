import { HARD_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  PayeeDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export async function getPayeeById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "company_id",
    "name",
    "type",
    "fixed_amount",
    "account_number",
    "bank_name",
    "account_holder_name",
    "ifsc_code",
    "branch_name",
    "account_type",
    "aadhaar_number",
    "pan_number",
  ] as const;

  const { data, error } = await supabase
    .from("payee")
    .select(columns.join(","))
    .eq("id", id)
    .single<InferredType<PayeeDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getPayeeById Error", error);
  }

  return { data, error };
}

export async function getPayeesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "name",
    "type",
    "fixed_amount",
    "account_number",
    "bank_name",
    "account_holder_name",
    "ifsc_code",
    "branch_name",
    "account_type",
    "aadhaar_number",
    "pan_number",
  ] as const;

  const { data, error } = await supabase
    .from("payee")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(HARD_QUERY_LIMIT)
    .returns<InferredType<PayeeDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getPayeeByCompanyId Error", error);
  }

  return { data, error };
}

export async function getPayeeIdsByPayeeNames({
  supabase,
  payeeNames,
}: {
  supabase: TypedSupabaseClient;
  payeeNames: string[];
}) {
  const columns = ["id"] as const;

  const { data, error } = await supabase
    .from("payee")
    .select(columns.join(","))
    .in("name", payeeNames)
    .returns<InferredType<PayeeDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getPayeeIdsByPayeeNames Error", error);
    return { data: [], missing: [], error };
  }

  return { data, error };
}

export async function getPayeeBankDetailsById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "account_number",
    "bank_name",
    "account_holder_name",
    "ifsc_code",
    "branch_name",
    "account_type",
  ] as const;

  const { data, error } = await supabase
    .from("payee")
    .select(columns.join(","))
    .eq("id", id)
    .single<InferredType<PayeeDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getPayeeById Error", error);
  }

  return { data, error };
}

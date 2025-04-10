import { HARD_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  PaymentFieldDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export type PaymentFieldDataType = Pick<
  PaymentFieldDatabaseRow,
  | "id"
  | "calculation_type"
  | "company_id"
  | "consider_for_epf"
  | "consider_for_esic"
  | "amount"
  | "is_pro_rata"
  | "name"
  | "is_active"
  | "payment_type"
  | "is_overtime"
>;

export async function getPaymentFieldById({
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
    "amount",
    "calculation_type",
    "payment_type",
    "is_active",
    "consider_for_epf",
    "consider_for_esic",
    "is_pro_rata",
    "is_overtime",
  ] as const;

  const { data, error } = await supabase
    .from("payment_fields")
    .select(columns.join(","))
    .eq("id", id)
    .single<PaymentFieldDataType>();

  if (error) {
    console.error("getPaymentFieldById Error", error);
  }

  return { data, error };
}

export async function getPaymentFieldNamesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = ["id", "name"] as const;

  const { data, error } = await supabase
    .from("payment_fields")
    .select(`${columns.join(",")}`)
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<
      InferredType<PaymentFieldDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error("getPaymentFieldNamesByCompanyId Error", error);
  }

  return {
    data,
    error,
  };
}

export async function getPaymentFieldsByCompanyId({
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
    "amount",
    "calculation_type",
    "payment_type",
    "is_active",
    "consider_for_epf",
    "consider_for_esic",
    "is_pro_rata",
    "is_overtime",
  ] as const;

  const { data, error } = await supabase
    .from("payment_fields")
    .select(`${columns.join(",")}`)
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<PaymentFieldDataType[]>();

  if (error) {
    console.error("getPaymentFieldsByCompanyId Error", error);
  }

  return {
    data,
    error,
  };
}

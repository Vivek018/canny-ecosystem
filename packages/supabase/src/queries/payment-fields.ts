import { HARD_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  PaymentFieldDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export async function getPaymentFieldById({
  supabase,
  id,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  id: string;
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
  ] as const;

  const { data, error } = await supabase
    .from("payment_fields")
    .select(columns.join(","))
    .eq("id", id)
    .eq("company_id", companyId)
    .single<InferredType<PaymentFieldDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

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
>;

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
  ] as const;

  const {data, error} = await supabase
    .from("payment_fields")
    .select(`${columns.join(",")}`)
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .returns<PaymentFieldDataType[]>();

  return {
    data,
    error,
  };
}

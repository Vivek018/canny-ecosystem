import type {
  GratuityDatabaseRow,
  InferredType,
  TypedSupabaseClient,
} from "../types";
import { SINGLE_QUERY_LIMIT } from "../constant";

export async function getGratuityByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "is_default",
    "eligibility_years",
    "present_day_per_year",
    "payment_days_per_year",
    "max_multiply_limit",
    "max_amount_limit",
  ] as const;

  const { data, error } = await supabase
    .from("gratuity")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .eq("is_default", true)
    .limit(SINGLE_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .maybeSingle<InferredType<GratuityDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getGratuityByCompanyId Error", error);
  }

  return { data, error };
}

export const getGratuityById = async ({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) => {
  const columns = [
    "id",
    "is_default",
    "eligibility_years",
    "present_day_per_year",
    "payment_days_per_year",
    "max_multiply_limit",
    "max_amount_limit",
  ] as const;

  const { data, error } = await supabase
    .from("gratuity")
    .select(columns.join(","))
    .eq("id", id)
    .limit(SINGLE_QUERY_LIMIT)
    .single<InferredType<GratuityDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getGratuityById Error", error);
  }

  return { data, error };
};

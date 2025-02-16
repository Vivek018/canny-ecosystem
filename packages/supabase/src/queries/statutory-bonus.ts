import { SINGLE_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  StatutoryBonusDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export type StatutoryBonusDataType = Pick<
  StatutoryBonusDatabaseRow,
  "id" | "company_id" | "payment_frequency" | "percentage" | "payout_month"
>;

export const getStatutoryBonusById = async ({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) => {
  const columns = [
    "id",
    "company_id",
    "payment_frequency",
    "percentage",
    "payout_month",
  ] as const;

  const { data, error } = await supabase
    .from("statutory_bonus")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<StatutoryBonusDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getStatutoryBonusById Error", error);
  }

  return { data, error };
};

export const getStatutoryBonusByCompanyId = async ({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) => {
  const columns = [
    "id",
    "company_id",
    "payment_frequency",
    "percentage",
    "payout_month",
  ] as const;

  const { data, error } = await supabase
    .from("statutory_bonus")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .eq("is_default", true)
    .limit(SINGLE_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .maybeSingle<
      InferredType<StatutoryBonusDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getStatutoryBonusByCompanyId Error", error);
  }

  return { data, error };
};

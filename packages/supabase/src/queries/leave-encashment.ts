import type {
  InferredType,
  LeaveEncashmentDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { SINGLE_QUERY_LIMIT } from "../constant";

export async function getLeaveEncashmentByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "eligible_years",
    "max_encashable_leaves",
    "max_encashment_amount",
    "encashment_multiplier",
    "working_days_per_year",
    "encashment_frequency",
    "is_default",
  ] as const;

  const { data, error } = await supabase
    .from("leave_encashment")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .eq("is_default", true)
    .order("created_at", { ascending: false })
    .limit(SINGLE_QUERY_LIMIT)
    .maybeSingle<
      InferredType<LeaveEncashmentDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getLeaveEncashmentByCompanyId Error", error);
  }

  return { data, error };
}

export const getLeaveEncashmentById = async ({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) => {
  const columns = [
    "id",
    "company_id",
    "eligible_years",
    "max_encashable_leaves",
    "max_encashment_amount",
    "encashment_multiplier",
    "working_days_per_year",
    "encashment_frequency",
    "is_default",
  ] as const;

  const { data, error } = await supabase
    .from("leave_encashment")
    .select(columns.join(","))
    .eq("id", id)
    .limit(SINGLE_QUERY_LIMIT)
    .single<
      InferredType<LeaveEncashmentDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getLeaveEncashmentById Error", error);
  }

  return { data, error };
};

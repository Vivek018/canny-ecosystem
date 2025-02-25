import { HARD_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  PaySequenceDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export type PaySequenceDataType = Pick<
  PaySequenceDatabaseRow,
  | "id"
  | "company_id"
  | "pay_day"
  | "working_days"
  | "overtime_multiplier"
  | "name"
>;

export async function getPaySequenceByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "name",
    "overtime_multiplier",
    "working_days",
    "pay_day",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("pay_sequence")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(HARD_QUERY_LIMIT)
    .returns<
      InferredType<PaySequenceDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error("getPaySequenceInSite Error", error);
  }

  return { data, error };
}

export async function getPaySequenceById({
  supabase,
  paySequenceId,
}: {
  supabase: TypedSupabaseClient;
  paySequenceId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "name",
    "working_days",
    "pay_day",
    "overtime_multiplier",
  ] as const;

  const { data, error } = await supabase
    .from("pay_sequence")
    .select(columns.join(","))
    .eq("id", paySequenceId)
    .single<InferredType<PaySequenceDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getPaySequenceById Error", error);
  }

  return { data, error };
}

export async function getPaySequenceNameByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const { data, error } = await supabase
    .from("pay_sequence")
    .select("id, name,pay_day")
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<{ id: string; name: string; pay_day: number }[]>();

  if (error) {
    console.error("getPaySequenceNamesByCompanyId Error", error);
  }

  return { data, error };
}

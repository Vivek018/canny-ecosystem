import type {
  InferredType,
  LabourWelfareFundDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT } from "../constant";

export async function getLabourWelfareFundById({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string;}) {
  const columns = [
    "id",
    "company_id",
    "state",
    "employee_contribution",
    "employer_contribution",
    "deduction_cycle",
    "status",
  ] as const;

  const { data, error } = await supabase
    .from("labour_welfare_fund")
    .select(columns.join(","))
    .eq("id", id)
    .single<InferredType<LabourWelfareFundDatabaseRow, (typeof columns)[number]>>();

  if (error) console.error(error);

  return { data, error };
}

export async function getLabourWelfareFundsByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const columns = [
    "id",
    "company_id",
    "state",
    "employee_contribution",
    "employer_contribution",
    "deduction_cycle",
    "status",
  ] as const;

  const { data, error } = await supabase
    .from("labour_welfare_fund")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<InferredType<LabourWelfareFundDatabaseRow, (typeof columns)[number]>[]>();

  if (error) console.error(error);

  return { data, error };
}
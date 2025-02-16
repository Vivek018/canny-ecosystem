import type {
  InferredType,
  LabourWelfareFundDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT, SINGLE_QUERY_LIMIT } from "../constant";

export async function getLabourWelfareFundById({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string }) {
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
    .single<
      InferredType<LabourWelfareFundDatabaseRow, (typeof columns)[number]>
    >();

  if (error) console.error("getLabourWelfareFundById Error", error);

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
    .returns<
      InferredType<LabourWelfareFundDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) console.error("getLabourWelfareFundsByCompanyId Error", error);

  return { data, error };
}

export async function getLabourWelfareFundByStateAndCompanyId({
  supabase,
  state,
  companyId,
}: { supabase: TypedSupabaseClient; state: string; companyId: string }) {
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
    .eq("state", state)
    .eq("company_id", companyId)
    .limit(SINGLE_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .single<
      InferredType<LabourWelfareFundDatabaseRow, (typeof columns)[number]>
    >();

  if (error) console.error("getLabourWelfareFundByStateAndCompanyId Error", error);

  return { data, error };
}

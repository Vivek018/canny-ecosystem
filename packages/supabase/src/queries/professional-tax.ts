import { HARD_QUERY_LIMIT } from "../constant";
import type { InferredType, ProfessionalTaxDatabaseRow, TypedSupabaseClient } from "../types";

export async function getProfessionalTaxesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "state",
    "pt_number",
    "deduction_cycle",
    "gross_salary_range",
  ] as const;

  const { data, error } = await supabase
    .from("professional_tax")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<
      InferredType<ProfessionalTaxDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getProfessionalTaxById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "company_id",
    "state",
    "pt_number",
    "deduction_cycle",
    "gross_salary_range",
  ] as const;

  const { data, error } = await supabase
    .from("professional_tax")
    .select(columns.join(","))
    .eq("id", id)
    .single<InferredType<ProfessionalTaxDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

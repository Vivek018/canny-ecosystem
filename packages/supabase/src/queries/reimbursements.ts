import { HARD_QUERY_LIMIT } from "../constant";
import type{ ReimbursementRow, TypedSupabaseClient } from "../types";


export async function getReimbursementsByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "company_id",
    "is_deductible",
    "status",
    "claimed_amount",
    "approved_amount",
    "submitted_date",
    
  ] as const;

  const { data, error } = await supabase
    .from("reimbursements")
    .select(columns.join(","))
    .limit(HARD_QUERY_LIMIT)
    .eq("company_id", companyId)
    .returns<Omit<ReimbursementRow, "created_at" | "updated_at">[]>();

  if (error) {
    console.error(error);
  }
  
  return { data, error };
}

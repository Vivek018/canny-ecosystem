import { HARD_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  ReimbursementRow,
  TypedSupabaseClient,
} from "../types";

export async function getReimbursementsByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "employees (id, first_name, last_name)",
    "company_id",
    "is_deductible",
    "status",
    "amount",
    "user_id",
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

export async function getReimbursementsByEmployeeId({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "company_id",
    "is_deductible",
    "status",
    "amount",
    "submitted_date",
    "user_id",
  ] as const;

  const { data, error } = await supabase
    .from("reimbursements")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .order("created_at", {ascending: false})
    .limit(HARD_QUERY_LIMIT)
    .returns<InferredType<ReimbursementRow, (typeof columns)[ number ]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

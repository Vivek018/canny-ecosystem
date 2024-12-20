import type {
  InferredType,
  ReimbursementRow,
  TypedSupabaseClient,
} from "../types";

export async function getReimbursementsByEmployeeId({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {

  const columns = [
    "id",
    "employees (id, first_name, last_name)",
    "company_id",
    "is_deductible",
    "status",
    "amount",
    "submitted_date",
    "users (id, email)",
  ] as const;

  const { data, error } = await supabase
    .from("reimbursements")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .returns<InferredType<ReimbursementRow, (typeof columns)[number]>[]>();

  if (error) console.error(error);

  return { data, error };
}

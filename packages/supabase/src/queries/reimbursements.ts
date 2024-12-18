
import type {
  InferredType,
  ReimbursementRow,
  TypedSupabaseClient,
} from "../types";

export async function getReimbursementsByCompanyId({
  supabase,
  companyId,
  from,
  to,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  from: number;
  to: number;
}) {
  const columns = [
    "id",
    "employees (id, first_name, last_name)",
    "company_id",
    "is_deductible",
    "status",
    "amount",
    "users (id, email)",
    "submitted_date",
  ] as const;

  const { data, error } = await supabase
    .from("reimbursements")
    .select(columns.join(","), { count: "exact" })
    .eq("company_id", companyId)
    .range(from, to)
    .order("created_at", { ascending: false })
    .returns<Omit<ReimbursementRow, "created_at" | "updated_at">[]>();

  if (error) {
    console.error("Error fetching reimbursements:", error);
  }

  return { data, error };
}

export async function getReimbursementsById({
  supabase,
  reimbursementId,
}: {
  supabase: TypedSupabaseClient;
  reimbursementId: string;
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
    .eq("id", reimbursementId)
    .single<InferredType<ReimbursementRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}


type ReimbursementRowNew = {
  id: string;
  company_id: string;
  is_deductible: boolean;
  status: string;
  amount: number;
  submitted_date: string;
  employees: { id: string; first_name: string; last_name: string };
  users: { id: string; email: string };
};

export async function getReimbursementsByEmployeeId({
  supabase,
  employeeId,
  from,
  to,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  from: number;
  to: number;
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
    .range(from, to)
    .order("created_at", { ascending: false })
    .returns<ReimbursementRowNew[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

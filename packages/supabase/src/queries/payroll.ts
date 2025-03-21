import { HARD_QUERY_LIMIT } from "../constant";
import type {
  PayrollDatabaseRow,
  InferredType,
  TypedSupabaseClient,
  PayrollEntriesDatabaseRow,
  PaymentTemplateComponentDatabaseRow,
  EmployeeDatabaseRow,
} from "../types";


export async function getPendingOrSubmittedPayrollsByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "total_employees",
    "payroll_type",
    "status",
    "run_date",
    "total_net_amount",
    "commission",
    "company_id",
    "created_at"
  ] as const;

  const { data, error } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .in("status", ["pending", "submitted"])
    .order("created_at", { ascending: false })
    .limit(HARD_QUERY_LIMIT)
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

  if (error) console.error("getPendingOrSubmittedPayrollsByCompanyId Error", error);

  return { data, error };
}

export async function getApprovedPayrollsByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "total_employees",
    "payroll_type",
    "status",
    "run_date",
    "total_net_amount",
    "commission",
    "company_id",
    "created_at"
  ] as const;

  const { data, error } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .in("status", ["approved"])
    .order("created_at", { ascending: false })
    .limit(HARD_QUERY_LIMIT)
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

  if (error) console.error("getApprovedPayrollsByCompanyId Error", error);

  return { data, error };
}

export async function getPayrollById({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const columns = [
    "id",
    "total_employees",
    "payroll_type",
    "status",
    "run_date",
    "total_net_amount",
    "commission",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("id", payrollId)
    .single<InferredType<PayrollDatabaseRow, (typeof columns)[number]>>();

  if (error) console.error("getPayrollById Error", error);

  return { data, error };
}

export type PayrollEntriesWithTemplateComponents = Pick<
  PayrollEntriesDatabaseRow,
  "id" | "employee_id" | "payment_status" | "amount"
> & {
  payment_template_components: Pick<
    PaymentTemplateComponentDatabaseRow,
    "id" | "target_type" | "calculation_value"
  >;
};

export type PayrollEntriesWithEmployee = Omit<PayrollEntriesDatabaseRow, "created_at" | "updated_at"> & { employees: Pick<EmployeeDatabaseRow, "first_name" | "middle_name" | "last_name" | "employee_code"> }

export async function getPayrollEntriesByPayrollId({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "reimbursement_id",
    "exit_id",
    "payment_status",
    "amount",
    "payroll_id"
  ] as const;

  const { data, error } = await supabase
    .from("payroll_entries")
    .select(`${columns.join(",")}, employees!left(id,company_id,first_name, middle_name, last_name, employee_code)`)
    .eq("payroll_id", payrollId)
    .order("created_at", { ascending: false })
    .returns<PayrollEntriesWithEmployee[]>();

  if (error) console.error("getPayrollEntriesByPayrollId Error", error);

  return { data, error };
}
export async function getPayrollEntryById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "reimbursement_id",
    "exit_id",
    "payment_status",
    "amount",
    "payroll_id",
  ] as const;

  const { data, error } = await supabase
    .from("payroll_entries")
    .select(`${columns.join(",")}, employees!left(id,company_id,first_name, middle_name, last_name, employee_code)`)
    .eq("id", id)
    .single<PayrollEntriesWithEmployee>();

  if (error) console.error("getPayrollEntryById Error", error);

  return { data, error };
}
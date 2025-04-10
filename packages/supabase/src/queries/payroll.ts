import { HARD_QUERY_LIMIT } from "../constant";
import type {
  PayrollDatabaseRow,
  InferredType,
  TypedSupabaseClient,
  PayrollEntriesDatabaseRow,
  EmployeeDatabaseRow,
  SalaryEntriesDatabaseRow,
} from "../types";

export type ImportPayrollDataType = Pick<
  PayrollEntriesDatabaseRow,
  "employee_id" | "amount"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

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
    "created_at",
  ] as const;

  const { data, error } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .in("status", ["pending", "submitted"])
    .order("created_at", { ascending: false })
    .limit(HARD_QUERY_LIMIT)
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

  if (error)
    console.error("getPendingOrSubmittedPayrollsByCompanyId Error", error);

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
    "created_at",
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
    "created_at",
  ] as const;

  const { data, error } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("id", payrollId)
    .maybeSingle<InferredType<PayrollDatabaseRow, (typeof columns)[number]>>();

  if (error) console.error("getPayrollById Error", error);

  return { data, error };
}

export type PayrollEntriesWithEmployee = Omit<
  PayrollEntriesDatabaseRow,
  "created_at" | "updated_at"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    | "first_name"
    | "middle_name"
    | "last_name"
    | "employee_code"
    | "company_id"
    | "id"
  >;
};

export type SalaryEntriesWithEmployee = Pick<
  EmployeeDatabaseRow,
  | "first_name"
  | "middle_name"
  | "last_name"
  | "employee_code"
  | "company_id"
  | "id"
> & {
  salary_entries: Omit<SalaryEntriesDatabaseRow, "created_at" | "updated_at">[];
};

export async function getSalaryEntriesByPayrollId({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  console.log("Backend Id", payrollId);
  
  const columns = [
    "id",
    "month",
    "year",
    "present_days",
    "overtime_hours",
    "employee_id",
    "template_component_id",
    "payroll_id",
    "field_name",
    "type",
    "amount",
    "is_pro_rata",
    "consider_for_epf",
    "consider_for_esic",
  ] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `id, company_id, first_name, middle_name, last_name, employee_code, salary_entries!inner(${columns.join(
        ","
      )})`
    )
    .eq("salary_entries.payroll_id", payrollId)
    .order("type, field_name", {
      ascending: true,
      referencedTable: "salary_entries",
    })
    .returns<SalaryEntriesWithEmployee[]>();

  if (error) {
    console.error("getSalaryEntriesByPayrollId Error", error);
  }
  console.log("Backend Data", data);

  return { data, error };
}

export async function getSalaryEntriesByPayrollAndEmployeeId({
  supabase,
  payrollId,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
  employeeId: string;
}) {
  const columns = [
    "id",
    "month",
    "year",
    "present_days",
    "overtime_hours",
    "employee_id",
    "template_component_id",
    "payroll_id",
    "field_name",
    "type",
    "amount",
    "is_pro_rata",
    "consider_for_epf",
    "consider_for_esic",
  ] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `id, company_id, first_name, middle_name, last_name, employee_code, salary_entries!inner(${columns.join(
        ","
      )})`
    )
    .eq("salary_entries.payroll_id", payrollId)
    .eq("id", employeeId)
    .single<SalaryEntriesWithEmployee>();

  if (error) {
    console.error("getSalaryEntriesByPayrollAndEmployeeId Error", error);
  }

  return { data, error };
}

export async function getSalaryEntryById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "month",
    "year",
    "present_days",
    "overtime_hours",
    "employee_id",
    "template_component_id",
    "payroll_id",
    "field_name",
    "type",
    "amount",
    "is_pro_rata",
    "consider_for_epf",
    "consider_for_esic",
  ] as const;

  const { data, error } = await supabase
    .from("salary_entries")
    .select(`${columns.join(",")}`)
    .eq("id", id)
    .single<InferredType<SalaryEntriesDatabaseRow, (typeof columns)[number]>>();

  if (error) console.error("getSalaryEntryById Error", error);

  return { data, error };
}

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
    "payroll_id",
    "created_at",
  ] as const;

  const { data, error } = await supabase
    .from("payroll_entries")
    .select(
      `${columns.join(
        ","
      )}, employees!left(id,company_id,first_name, middle_name, last_name, employee_code)`
    )
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
    .select(
      `${columns.join(
        ","
      )}, employees!left(id,company_id,first_name, middle_name, last_name, employee_code)`
    )
    .eq("id", id)
    .single<PayrollEntriesWithEmployee>();

  if (error) console.error("getPayrollEntryById Error", error);

  return { data, error };
}

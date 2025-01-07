import { SINGLE_QUERY_LIMIT } from "../constant";
import type {
  PayrollDatabaseRow,
  InferredType,
  TypedSupabaseClient,
  PayrollEntriesDatabaseRow,
} from "../types";

export async function getPayrollBySiteId({
  supabase,
  site_id,
}: {
  supabase: TypedSupabaseClient;
  site_id: string;
}) {
  const columns = [
    "id",
    "commission",
    "run_date",
    "site_id",
    "status",
    "total_employees",
    "total_net_amount",
  ] as const;

  const { data, error } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("site_id", site_id)
    .order("created_at", { ascending: false })
    .returns<PayrollDatabaseRow[]>();

  if (error) console.error(error);

  return { data, error };
}

export async function getEarliestPayrollBySiteId({
  supabase,
  site_id,
}: {
  supabase: TypedSupabaseClient;
  site_id: string;
}) {
  const columns = [
    "id",
    "commission",
    "run_date",
    "site_id",
    "status",
    "total_employees",
    "total_net_amount",
  ] as const;

  const { data, error } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("site_id", site_id)
    .eq("status","pending")
    .order("created_at", { ascending: true })
    .single<InferredType<PayrollDatabaseRow, (typeof columns)[number]>>();

  if (error) console.error(error);

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
    "payment_template_components_id",
    "payment_status",
    "amount",
  ] as const;

  const { data, error } = await supabase
    .from("payroll_entries")
    .select(columns.join(","))
    .eq("payroll_id", payrollId);

  if (error) console.error(error);

  return { data, error };
}

export async function getPendingPayrollCountBySiteId({
  supabase,
  siteId,
}: {
  supabase: TypedSupabaseClient;
  siteId: string;
}) {
  const { data, error } = await supabase
    .from("payroll")
    .select("id",{count:"exact"})
    .eq("site_id", siteId);

  if (error) console.error(error);

  return { data:data?.length, error };
}

export async function getPayrollEnrtyAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId({
  supabase,
  employeeId,
  payrollId,
  templateComponentId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  payrollId: string;
  templateComponentId: string;
}) {
  const columns = ["amount"] as const;

  const { data, error } = await supabase
    .from("payroll_entries")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .eq("payroll_id", payrollId)
    .eq("payment_template_components_id", templateComponentId)
    .order("created_at", { ascending: false })
    .limit(SINGLE_QUERY_LIMIT)
    .single<
      InferredType<PayrollEntriesDatabaseRow, (typeof columns)[number]>
    >();

  if (error) console.error(error);

  return { data, error };
}

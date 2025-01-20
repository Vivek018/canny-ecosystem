import { formatUTCDate } from "@canny_ecosystem/utils";
import { SINGLE_QUERY_LIMIT } from "../constant";
import type {
  PayrollDatabaseRow,
  InferredType,
  TypedSupabaseClient,
  PayrollEntriesDatabaseRow,
  PaymentTemplateComponentDatabaseRow,
} from "../types";

export async function getPayrollWithSiteBySiteId({
  supabase,
  site_id,
  params,
}: {
  supabase: TypedSupabaseClient;
  site_id: string[];
  params: {
    filters?: {
      start_month?: string | undefined | null;
      end_month?: string | undefined | null;
      start_year?: string | undefined | null;
      end_year?: string | undefined | null;
    };
  };
}) {
  const { filters } = params;

  const columns = [
    "id",
    "commission",
    "run_date",
    "site_id",
    "status",
    "total_employees",
    "total_net_amount",
  ] as const;

  const query = supabase
    .from("payroll")
    .select(`${columns.join(",")}, project_sites!inner(id, name)`)
    .in("site_id", Array.isArray(site_id) ? site_id : [site_id]);

  // Filters
  if (filters?.start_year || filters?.end_year) {
    const { start_month, start_year, end_year, end_month } = filters;

    let endDateLastDay = 30;

    if (end_year) {
      const year = Number.parseInt(end_year, 10);
      const month = new Date(`${end_month} 1, ${end_year}`).getMonth();

      endDateLastDay = new Date(year, month + 1, 0).getDate();
    }

    const start_date = new Date(`${start_month} 1, ${start_year}`);
    const end_date = new Date(`${end_month} ${endDateLastDay}, ${end_year}`);

    if (start_year)
      query.gte(
        "run_date",
        formatUTCDate(start_date.toISOString().split("T")[0]),
      );
    if (end_year)
      query.lte(
        "run_date",
        formatUTCDate(end_date.toISOString().split("T")[0]),
      );
  }

  const { data, error } = await query
    .order("run_date", { ascending: true })
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

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
    .eq("status", "pending")
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
    .select("id", { count: "exact" })
    .eq("site_id", siteId);

  if (error) console.error(error);

  return { data: data?.length, error };
}

export async function getPayrollEntryAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId({
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

export type PayrollEntriesWithTemplateComponents =  Pick<
PayrollEntriesDatabaseRow,
"id" | "employee_id" | "payment_status" | "amount"
> & {
payment_template_components: Pick<
  PaymentTemplateComponentDatabaseRow,
  "id" | "target_type" | "calculation_value"
>;
};

export async function getPayrollEntriesWithTemplateComponentsByPayrollId({
  supabase,
  payrollIds,
}: {
  supabase: TypedSupabaseClient;
  payrollIds: string[];
}) {
  const columns = ["id", "employee_id", "payment_status", "amount"] as const;

  const { data, error } = await supabase
    .from("payroll_entries")
    .select(
      `${columns.join(",")}, payment_template_components!inner(id, target_type, calculation_value)`,
    )
    .in("payroll_id", payrollIds)
    .returns<
      InferredType<
       PayrollEntriesWithTemplateComponents,
        (typeof columns)[number]
      >[]
    >();

  if (error) console.error(error);

  return { data, error };
}
import { SINGLE_QUERY_LIMIT } from "../constant";
import type {
  PayrollDatabaseRow,
  InferredType,
  TypedSupabaseClient,
  PayrollEntriesDatabaseRow,
} from "../types";

export async function getPayrollsBySiteId({
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
    .eq("site_id", siteId)
    .eq("status","pending");

  if (error) console.error(error);

  return { data:data?.length, error };
}

export async function getPayrollEntryAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId({
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

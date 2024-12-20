import type {
  PayrollDatabaseRow,
  InferredType,
  TypedSupabaseClient,
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
    .single<InferredType<PayrollDatabaseRow, (typeof columns)[number]>>();

  if (error) console.error(error);

  return { data, error };
}

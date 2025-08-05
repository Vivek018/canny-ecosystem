import type {
  InferredType,
  NotificationDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export async function getNotificationByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = ["id", "text", "company_id"] as const;

  const { data, error } = await supabase
    .from("notifications")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .maybeSingle<
      InferredType<NotificationDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getNotificationByCompanyId Error", error);
  }

  return { data, error };
}

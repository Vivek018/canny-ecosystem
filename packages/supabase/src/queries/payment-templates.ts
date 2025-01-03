import type {
  InferredType,
  PaymentTemplateAssignmentsDatabaseInsert,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT } from "../constant";

export async function getPaymentTemplatesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = ["id", "name"] as const;
  const { data, error } = await supabase
    .from("payment_templates")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: true })
    .returns<
      InferredType<
        PaymentTemplateAssignmentsDatabaseInsert,
        (typeof columns)[number]
      >[]
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}
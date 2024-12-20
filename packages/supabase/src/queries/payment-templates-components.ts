import type {
  InferredType,
  PaymentTemplateComponentsDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { SINGLE_QUERY_LIMIT } from "../constant";

export async function getPaymentTemplateComponentByTemplateId({
  supabase,
  templateID,
}: {
  supabase: TypedSupabaseClient;
  templateID: string;
}){
  const columns = [
    "id",
    "target_type",
    "payment_field_id",
    "epf_id",
    "esi_id",
    "bonus_id",
    "pt_id",
    "lwf_id",
    "component_type",
    "calculation_type",
    "calculation_value",
    "display_order",
  ] as const;

  const { data, error } = await supabase
    .from("payment_template_components")
    .select(columns.join(","))
    .limit(SINGLE_QUERY_LIMIT)
    .eq("template_id", templateID)
    .single<
      InferredType<
        PaymentTemplateComponentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) console.error(error);

  return { data, error };
}

import type {PaymentTemplateComponentsDatabaseRow, TypedSupabaseClient} from "../types";

export async function getPaymentTemplateComponentsByTemplateId({
  supabase,
  templateID,
}: {
  supabase: TypedSupabaseClient;
  templateID: string;
}) {
  const columns = [
    "id",
    "target_type",
    "template_id",
    "payment_field_id",
    "epf_id",
    "esi_id",
    "bonus_id",
    "pt_id",
    "lwf_id",
    "component_type",
    "calculation_value",
    "display_order",
  ] as const;

  const { data, error } = await supabase
    .from("payment_template_components")
    .select(columns.join(","))
    .eq("template_id", templateID)
    .returns<PaymentTemplateComponentsDatabaseRow[]>();

  if (error) console.error(error);

  return { data, error };
}

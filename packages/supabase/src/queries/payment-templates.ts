import type { PostgrestError } from "@supabase/supabase-js";
import type { TypedSupabaseClient } from "../types";

type PaymentTemplate = {
  id: string;
  name: string;
}

export async function getPaymentTemplatesByCompanyId({
  supabase,
  company_id,
}: { 
  supabase: TypedSupabaseClient; 
  company_id: string 
}): Promise<{ 
  data: PaymentTemplate[] | null; 
  error: PostgrestError | null 
}> {
  const columns = ["id", "name"] as const;
  const { data, error } = await supabase
    .from("payment_templates")
    .select(columns.join(","))
    .eq("company_id", company_id);
  
  if (error) console.error(error);
  return { data: data as PaymentTemplate[] | null, error };
}
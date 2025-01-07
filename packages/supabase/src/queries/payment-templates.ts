import type { PostgrestError } from "@supabase/supabase-js";
import type { InferredType, PaymentTemplateAssignmentsDatabaseRow, TypedSupabaseClient } from "../types";

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

export async function getPaymentTemplateByEmployeeId({
  supabase,
  employeeId,
}: { supabase: TypedSupabaseClient; employeeId: string }) {
  const columns = ["template_id"] as const;

  const { data, error } = await supabase
    .from("payment_template_assignments")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .single<
      InferredType<
        PaymentTemplateAssignmentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) console.error(error);

  return { data, error };
}

export async function getPaymentTemplateBySiteId({
  supabase,
  site_id,
}: { supabase: TypedSupabaseClient; site_id: string }) {
  const columns = ["template_id"] as const;

  const { data, error } = await supabase
    .from("payment_template_assignments")
    .select(columns.join(","))
    .eq("site_id", site_id)
    .single<
      InferredType<
        PaymentTemplateAssignmentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) console.error(error);

  return { data, error };
}
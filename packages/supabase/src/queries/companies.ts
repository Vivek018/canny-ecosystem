import type { TypedSupabaseClient } from "../types";
import { HARD_QUERY_LIMIT, SINGLE_QUERY_LIMIT } from "../constant";

export async function getCompaniesQuery({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .limit(HARD_QUERY_LIMIT);

  return { data, error };
}

export async function getFirstCompanyQuery({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .limit(SINGLE_QUERY_LIMIT)
    .single();

  return { data, error };
}

export async function getCompanyByIdQuery({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string }) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, email_suffix, logo, company_size, company_type")
    .eq("id", id)
    .single();

  return { data, error };
}

// Company Registration Details
export async function getCompanyRegistrationDetailsByCompanyIdQuery({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase
    .from("company_registration_details")
    .select("company_id, gst_number, registration_number, pan_number, pf_number, esi_number, pt_number, lwf_number")
    .eq("company_id", companyId)
    .single();

  return { data, error };
}
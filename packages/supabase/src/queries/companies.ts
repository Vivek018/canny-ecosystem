import type { RelationshipDatabaseRow, TypedSupabaseClient } from "../types";
import { HARD_QUERY_LIMIT, SINGLE_QUERY_LIMIT } from "../constant";

export async function getCompanies({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .limit(HARD_QUERY_LIMIT);

  return { data, error };
}

export async function getFirstCompany({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .limit(SINGLE_QUERY_LIMIT)
    .single();

  return { data, error };
}

export async function getCompanyById({
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
export async function getCompanyRegistrationDetailsByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase
    .from("company_registration_details")
    .select(
      "company_id, gst_number, registration_number, pan_number, pf_number, esic_number, pt_number, lwf_number",
    )
    .eq("company_id", companyId)
    .single();

  return { data, error };
}

// Company Locations
export async function getLocationsForSelectByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase
    .from("company_locations")
    .select("id, name")
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT);

  return { data, error };
}

export async function getLocationsByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase
    .from("company_locations")
    .select(
      "id, company_id, name, address_line_1, address_line_2, city, state, pincode, latitude, longitude, is_primary",
    )
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT);

  return { data, error };
}

export async function getLocationById({
  supabase,
  id,
  companyId,
}: { supabase: TypedSupabaseClient; id: string; companyId: string }) {
  const { data, error } = await supabase
    .from("company_locations")
    .select(
      "id, company_id, name, address_line_1, address_line_2, city, state, pincode, latitude, longitude, is_primary",
    )
    .eq("id", id)
    .eq("company_id", companyId)
    .single();

  return { data, error };
}

export type RelationshipWithCompany = RelationshipDatabaseRow & {
  parent_company: { id: string; name: string };
  child_company: { id: string; name: string };
};

// Company Relationships
export async function getRelationshipsByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase
    .from("company_relationships")
    .select(
      `id, parent_company_id, child_company_id, relationship_type, start_date, end_date, terms, is_active, parent_company:companies!parent_company_id (id, name),
      child_company:companies!child_company_id (id, name)`,
    )
    .or(`parent_company_id.eq.${companyId},child_company_id.eq.${companyId}`)
    .returns<Omit<RelationshipWithCompany, "created_at" | "updated_at">[]>()
    .limit(HARD_QUERY_LIMIT);

  return { data, error };
}

export async function getRelationshipById({
  supabase,
  id,
  companyId,
}: { supabase: TypedSupabaseClient; id: string; companyId: string }) {
  const { data, error } = await supabase
    .from("company_relationships")
    .select(
      `id, parent_company_id, child_company_id, relationship_type, start_date, end_date, terms, is_active, parent_company:companies!parent_company_id (id, name),
      child_company:companies!child_company_id (id, name)`,
    )
    .eq("id", id)
    .or(`parent_company_id.eq.${companyId},child_company_id.eq.${companyId}`)
    .single<Omit<RelationshipWithCompany, "created_at" | "updated_at">>();

  return { data, error };
}

export async function getRelationshipTermsById({
  supabase,
  id,
  companyId,
}: { supabase: TypedSupabaseClient; id: string; companyId: string }) {
  const { data, error } = await supabase
    .from("company_relationships")
    .select("terms")
    .eq("id", id)
    .or(`parent_company_id.eq.${companyId},child_company_id.eq.${companyId}`)
    .single();

  return { data, error };
}

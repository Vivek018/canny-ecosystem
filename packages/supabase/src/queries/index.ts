import { HARD_QUERY_LIMIT, SINGLE_QUERY_LIMIT } from "../constant";
import type { TypedSupabaseClient } from "../types";

// Users
export async function getUserByEmailQuery({
  supabase,
  email,
}: {
  supabase: TypedSupabaseClient;
  email: string;
}) {
  const { data, error } = await supabase
    .from("user")
    .select(
      "id, first_name, last_name, email, avatar, last_checked_in, created_at",
    )
    .eq("email", email)
    .limit(SINGLE_QUERY_LIMIT)
    .single();

  return { data, error };
}

// Companies
export async function getCompaniesQuery({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const { data, error } = await supabase
    .from("company")
    .select("id, name")
    .limit(HARD_QUERY_LIMIT);

  return { data, error };
}

export async function getFirstCompanyQuery({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const { data, error } = await supabase
    .from("company")
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
    .from("company")
    .select(
      "id, name, email_suffix, logo, service_charge, reimbursement_charge",
    )
    .eq("id", id)
    .single();

  return { data, error };
}

// Projects
export async function getProjectsInCompanyQuery({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase
    .from("project")
    .select("id, name, description, starting_date, ending_date, image")
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT);

  return { data, error };
}

export async function getProjectByIdQuery({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string }) {
  const { data, error } = await supabase
    .from("project")
    .select(
      "id, name, image, description, starting_date, ending_date, company_id",
    )
    .eq("id", id)
    .single();

  return { data, error };
}

// Pay Sequences
export async function getPaySequenceInProjectQuery({
  supabase,
  projectId,
}: { supabase: TypedSupabaseClient; projectId: string }) {
  const { data, error } = await supabase
    .from("pay_sequence")
    .select("id, pay_frequency, working_days, pay_day, project_id")
    .eq("project_id", projectId)
    .single();

  return { data, error };
}

// Locations
export async function getLocationsInCompanyQuery({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase
    .from("location")
    .select("id, name, city, state, pin_code, esic_code, is_main, address")
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT);

  return { data, error };
}

export async function getLocationByIdQuery({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string }) {
  const { data, error } = await supabase
    .from("location")
    .select(
      "id, name, city, state, pin_code, esic_code, is_main, address, company_id",
    )
    .eq("id", id)
    .single();

  return { data, error };
}

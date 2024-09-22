import { HARD_QUERY_LIMIT, SINGLE_QUERY_LIMIT } from "../constant";
import type { TypedSupabaseClient } from "../types";

export async function getUserQuery({
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

  if (error) {
    throw error;
  }

  return { data };
}

export async function getCompaniesQuery({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const { data, error } = await supabase
    .from("company")
    .select("id, name")
    .limit(HARD_QUERY_LIMIT);

  if (error) {
    throw error;
  }

  return { data };
}

export async function getFirstCompanyQuery({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const { data, error } = await supabase
    .from("company")
    .select("id, name")
    .limit(SINGLE_QUERY_LIMIT)
    .single();

  if (error) {
    throw error;
  }

  return { data };
}

export async function getLocationsInCompanyQuery({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase
    .from("location")
    .select("id, name, city, state, pin_code, esic_code, is_main, address")
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT);

  if (error) {
    throw error;
  }

  return { data };
}

export async function getLocationQuery({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string }) {
  const { data, error } = await supabase
    .from("location")
    .select("id, name, city, state, pin_code, esic_code, is_main, address, company_id")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return { data };
}

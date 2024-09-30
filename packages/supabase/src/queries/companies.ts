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
    .select("id, name, email_suffix, logo")
    .eq("id", id)
    .single();

  return { data, error };
}

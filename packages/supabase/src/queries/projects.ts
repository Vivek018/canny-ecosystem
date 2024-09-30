import type{ TypedSupabaseClient } from "../types";
import { HARD_QUERY_LIMIT } from "../constant";

// Projects
export async function getProjectsInCompanyQuery({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase
    .from("projects")
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
    .from("projects")
    .select(
      "id, name, image, description, starting_date, ending_date, company_id",
    )
    .eq("id", id)
    .single();

  return { data, error };
}

// ProjectSites
export async function getProjectSitesInProjectQuery({
  supabase,
  projectId,
}: { supabase: TypedSupabaseClient; projectId: string }) {
  const { data, error } = await supabase
    .from("project_sites")
    .select("id, name, city, state, pin_code, esic_code, is_main, address")
    .eq("project_id", projectId)
    .limit(HARD_QUERY_LIMIT)
    .order("is_main", { ascending: false });

  return { data, error };
}

export async function getProjectSiteByIdQuery({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string }) {
  const { data, error } = await supabase
    .from("project_sites")
    .select(
      "id, name, city, state, pin_code, esic_code, is_main, address, project_id",
    )
    .eq("id", id)
    .single();

  return { data, error };
}

// Pay Sequences
export async function getSitePaySequenceInSiteQuery({
  supabase,
  siteId,
}: { supabase: TypedSupabaseClient; siteId: string }) {
  const { data, error } = await supabase
    .from("site_pay_sequence")
    .select("id, pay_frequency, working_days, pay_day, site_id")
    .eq("site_id", siteId)
    .single();

  return { data, error };
}

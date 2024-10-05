import type {
  ProjectDatabaseRow,
  SiteDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT } from "../constant";

// Projects
export type ProjectsWithCompany = ProjectDatabaseRow & {
  project_client: { id: string; name: string; logo: string };
  end_client: { id: string; name: string; logo: string };
  primary_contractor: { id: string; name: string; logo: string };
};

export async function getProjectsInCompany({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase
    .from("projects")
    .select(`id, name, project_code, project_type,
      project_client:companies!project_client_id (id, name, logo),
      end_client:companies!end_client_id (id, name, logo), primary_contractor:companies!primary_contractor_id (id, name, logo), start_date, estimated_end_date, actual_end_date, status`)
    .or(
      `project_client_id.eq.${companyId},end_client_id.eq.${companyId},primary_contractor_id.eq.${companyId}`,
    )
    .returns<Omit<ProjectsWithCompany, "created_at" | "updated_at">[]>()
    .limit(HARD_QUERY_LIMIT);

  return { data, error };
}

export async function getProjectById({
  supabase,
  id,
  companyId,
}: { supabase: TypedSupabaseClient; id: string; companyId: string }) {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `id, name, project_code, project_type, description, project_client_id, end_client_id, primary_contractor_id, 
      project_client:companies!project_client_id (id, name),
      end_client:companies!end_client_id (id, name), primary_contractor:companies!primary_contractor_id (id, name), start_date, estimated_end_date, actual_end_date, status, risk_assessment, quality_standards, health_safety_requirements,environmental_considerations`,
    )
    .eq("id", id)
    .or(
      `project_client_id.eq.${companyId},end_client_id.eq.${companyId},primary_contractor_id.eq.${companyId}`,
    )
    .single<Omit<ProjectsWithCompany, "created_at" | "updated_at">>();

  return { data, error };
}

// ProjectSites
export type SitesWithLocation = SiteDatabaseRow & {
  company_location: { id: string; name: string };
};

export async function getSitesByProjectId({
  supabase,
  projectId,
}: { supabase: TypedSupabaseClient; projectId: string }) {
  const { data, error } = await supabase
    .from("project_sites")
    .select(
      `id, name, site_code, address_line_1, address_line_2, city, state, pincode, latitude, longitude, company_location_id, is_active, 
      company_location:company_locations!company_location_id (id, name), project_id`,
    )
    .eq("project_id", projectId)
    .limit(HARD_QUERY_LIMIT)
    .order("is_active", { ascending: false })
    .returns<Omit<SitesWithLocation, "created_at" | "updated_at">[]>();

  return { data, error };
}

export async function getSiteById({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string }) {
  const { data, error } = await supabase
    .from("project_sites")
    .select(
      `id, name, site_code, address_line_1, address_line_2, city, state, pincode, latitude, longitude, company_location_id, is_active, 
      company_location:company_locations!company_location_id (id, name), project_id`,
    )
    .eq("id", id)
    .single<Omit<SitesWithLocation, "created_at" | "updated_at">>();

  return { data, error };
}

// Pay Sequences
export async function getSitePaySequenceInSite({
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

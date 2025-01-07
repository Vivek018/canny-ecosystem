import type {
  InferredType,
  ProjectDatabaseRow,
  SiteDatabaseRow,
  SitePaySequenceDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT } from "../constant";

// Projects
export type ProjectsWithCompany = ProjectDatabaseRow & {
  project_client: { id: string; name: string; logo: string };
  end_client: { id: string; name: string; logo: string };
  primary_contractor: { id: string; name: string; logo: string };
};

export async function getProjectsByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "name",
    "project_code",
    "project_type",
    "project_client:companies!project_client_id (id, name, logo)",
    "end_client:companies!end_client_id (id, name, logo)",
    "primary_contractor:companies!primary_contractor_id (id, name, logo)",
    "start_date",
    "estimated_end_date",
    "actual_end_date",
    "status",
  ] as const;

  const { data, error } = await supabase
    .from("projects")
    .select(columns.join(","))
    .or(
      `project_client_id.eq.${companyId},end_client_id.eq.${companyId},primary_contractor_id.eq.${companyId}`,
    )
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<Omit<ProjectsWithCompany, "created_at" | "updated_at">[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getProjectNamesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const { data, error } = await supabase
    .from("projects")
    .select("name")
    .or(
      `project_client_id.eq.${companyId},end_client_id.eq.${companyId},primary_contractor_id.eq.${companyId}`,
    )
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<{ name: string }[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getProjectById({
  supabase,
  id,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  id: string;
  companyId: string;
}) {
  const columns = [
    "id",
    "name",
    "project_code",
    "project_type",
    "description",
    "project_client_id",
    "end_client_id",
    "primary_contractor_id",
    "project_client:companies!project_client_id (id, name)",
    "end_client:companies!end_client_id (id, name)",
    "primary_contractor:companies!primary_contractor_id (id, name)",
    "start_date",
    "estimated_end_date",
    "actual_end_date",
    "status",
    "risk_assessment",
    "quality_standards",
    "health_safety_requirements",
    "environmental_considerations",
  ] as const;

  const { data, error } = await supabase
    .from("projects")
    .select(columns.join(","))
    .eq("id", id)
    .or(
      `project_client_id.eq.${companyId},end_client_id.eq.${companyId},primary_contractor_id.eq.${companyId}`,
    )
    .single<Omit<ProjectsWithCompany, "created_at" | "updated_at">>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

// ProjectSites
export type SitesWithLocation = SiteDatabaseRow & {
  company_location: { id: string; name: string };
};

export async function getSitesByProjectId({
  supabase,
  projectId,
}: {
  supabase: TypedSupabaseClient;
  projectId: string;
}) {
  const columns = [
    "id",
    "name",
    "site_code",
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "company_location_id",
    "is_active",
    "company_location:company_locations!company_location_id (id, name)",
    "project_id",
  ] as const;

  const { data, error } = await supabase
    .from("project_sites")
    .select(columns.join(","))
    .eq("project_id", projectId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<Omit<SitesWithLocation, "created_at" | "updated_at">[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getAllSitesByProjectId({
  supabase,
  projectId,
}: {
  supabase: TypedSupabaseClient;
  projectId: string;
}) {
  const columns = ["id"] as const;
  const { data, error } = await supabase
    .from("project_sites")
    .select(columns.join(","))
    .eq("project_id", projectId)
    .returns<{id:string}[]>();

  if (error) console.error(error);

  return { data, error };
}

export async function getSitesWithEmployeeCountByProjectId({
  supabase,
  projectId,
}: {
  supabase: TypedSupabaseClient;
  projectId: string;
}) {
  const columns = [
    "id",
    "name",
    "site_code",
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "company_location_id",
    "is_active",
    "company_location:company_locations!company_location_id (id, name)",
    "project_id",
    "employees_count:employee_project_assignment!project_site_id(count)",
  ] as const;

  const { data, error } = await supabase
    .from("project_sites")
    .select(columns.join(","))
    .eq("project_id", projectId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<SitesWithLocation[]>();

  if (error) console.error(error);

  return { data, error };
}

export async function getSiteNamesByProjectName({
  supabase,
  projectName,
}: {
  supabase: TypedSupabaseClient;
  projectName: string;
}) {
  const { data, error } = await supabase
    .from("project_sites")
    .select(
      "name, projects!inner(name, project_client_id, end_client_id, primary_contractor_id)",
    )
    .eq("projects.name", projectName)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<{ name: string }[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getSiteById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "name",
    "site_code",
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "company_location_id",
    "is_active",
    "company_location:company_locations!company_location_id (id, name)",
    "project_id",
  ] as const;

  const { data, error } = await supabase
    .from("project_sites")
    .select(columns.join(","))
    .eq("id", id)
    .single<Omit<SitesWithLocation, "created_at" | "updated_at">>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

// Pay Sequences
export async function getSitePaySequenceInSite({
  supabase,
  siteId,
}: {
  supabase: TypedSupabaseClient;
  siteId: string;
}) {
  const columns = [
    "id",
    "pay_frequency",
    "working_days",
    "pay_day",
    "site_id",
  ] as const;

  const { data, error } = await supabase
    .from("site_pay_sequence")
    .select(columns.join(","))
    .eq("site_id", siteId)
    .single<
      InferredType<SitePaySequenceDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

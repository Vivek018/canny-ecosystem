import { HARD_QUERY_LIMIT, MID_QUERY_LIMIT } from "../constant";
import type { InferredType, SiteDatabaseRow, TypedSupabaseClient } from "../types";

// Sites
export type SitesWithLocation = SiteDatabaseRow & {
  company_location: { id: string; name: string };
  project: { id: string; name: string };
};

export async function getSitesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
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
    "capacity",
    "company_location:company_locations!company_location_id (id, name)",
    "project:projects!project_id (id, name)",
    "project_id",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("sites")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(MID_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<Omit<SitesWithLocation, "created_at" | "updated_at">[]>();

  if (error) {
    console.error("getSitesByCompanyId Error", error);
  }

  return { data, error };
}

export async function getSiteNamesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const { data, error } = await supabase
    .from("sites").select("id,name, projects!left(name)")
    .eq("company_id", companyId)
    .limit(MID_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<{ id: string; name: string; projects: { name: string } }[]>();

  if (error) {
    console.error("getSiteNamesByCompanyId Error", error);
  }

  return { data, count: data?.length, error };
}

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
    "capacity",
    "company_location:company_locations!company_location_id (id, name)",
    "project:projects!project_id (id, name)",
    "project_id",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("sites")
    .select(columns.join(","))
    .eq("project_id", projectId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<Omit<SitesWithLocation, "created_at" | "updated_at">[]>();

  if (error) {
    console.error("getSitesByProjectId Error", error);
  }

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
    .from("sites")
    .select(
      "name, projects!inner(name)"
    )
    .eq("projects.name", projectName)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<{ name: string }[]>();

  if (error) {
    console.error("getSiteNamesByProjectName Error", error);
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
    "capacity",
    "company_location:company_locations!company_location_id (id, name)",
    "project_id",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("sites").select(columns.join(","))
    .eq("id", id)
    .single<Omit<SitesWithLocation, "created_at" | "updated_at">>();

  if (error) {
    console.error("getSiteById Error", error);
  }

  return { data, error };
}


export async function getSiteIdsBySiteNames({
  supabase,
  siteNames,
}: {
  supabase: TypedSupabaseClient;
  siteNames: string[];
}) {
  const columns = ["name", "id"] as const;

  const { data, error } = await supabase
    .from("sites").select(columns.join(","))
    .in("name", siteNames)
    .returns<InferredType<SiteDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getSiteIdsBySiteNames Error", error);
  }

  return { data, error };
}




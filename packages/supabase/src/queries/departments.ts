import { MID_QUERY_LIMIT } from "../constant";
import type { DepartmentsDatabaseRow, InferredType, TypedSupabaseClient } from "../types";

export type DepartmentWithSite = DepartmentsDatabaseRow & {
  site: { id: string; name: string }
}

export async function getDepartmentsByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "name",
    "site_id",
    "company_id",
    "site:sites!site_id(id, name)",
    "created_at"
  ] as const;

  const { data, error } = await supabase
    .from("departments")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(MID_QUERY_LIMIT)
    .returns<DepartmentWithSite[]>();

  if (error) {
    console.error("getDepartmentsByCompanyId Error", error);
  }

  return { data, error };
}

export async function getDepartmentsBySiteId({
  supabase,
  siteId,
}: {
  supabase: TypedSupabaseClient;
  siteId: string;
}) {
  const columns = [
    "id",
    "name",
    "site_id",
    "company_id",
    "created_at"
  ] as const;

  const { data, error } = await supabase
    .from("departments")
    .select(columns.join(","))
    .eq("site_id", siteId)
    .order("created_at", { ascending: false })
    .limit(MID_QUERY_LIMIT)
    .returns<
      InferredType<DepartmentsDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error("getDepartmentsBySiteId Error", error);
  }

  return { data, error };
}

export async function getDepartmentById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = ["id", "name", "site_id", "company_id",] as const;

  const { data, error } = await supabase
    .from("departments")
    .select(columns.join(","))
    .eq("id", id)
    .single<DepartmentsDatabaseRow>();

  if (error) {
    console.error("getDepartmentById Error", error);
  }

  return { data, error };
}

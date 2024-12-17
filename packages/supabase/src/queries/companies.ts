import type {
  CompanyDatabaseRow,
  CompanyRegistrationDetailsRow,
  InferredType,
  LocationDatabaseRow,
  RelationshipDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT, SINGLE_QUERY_LIMIT } from "../constant";

export async function getCompanies({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const columns = ["id", "name"] as const;

  const { data, error } = await supabase
    .from("companies")
    .select(columns.join(","))
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<InferredType<CompanyDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getFirstCompany({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const columns = ["id", "name"] as const;

  const { data, error } = await supabase
    .from("companies")
    .select(columns.join(","))
    .limit(SINGLE_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .single<InferredType<CompanyDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getCompanyById({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string }) {
  const columns = [
    "id",
    "name",
    "email_suffix",
    "logo",
    "company_size",
    "company_type",
  ] as const;

  const { data, error } = await supabase
    .from("companies")
    .select(columns.join(","))
    .eq("id", id)
    .single<InferredType<CompanyDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

// Company Registration Details
export async function getCompanyRegistrationDetailsByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const columns = [
    "company_id",
    "gst_number",
    "registration_number",
    "pan_number",
    "pf_number",
    "esic_number",
    "pt_number",
    "lwf_number",
  ] as const;

  const { data, error } = await supabase
    .from("company_registration_details")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .single<
      InferredType<CompanyRegistrationDetailsRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

// Company Locations
export async function getLocationsForSelectByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const columns = ["id", "name"] as const;

  const { data, error } = await supabase
    .from("company_locations")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<InferredType<LocationDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getLocationsByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const columns = [
    "id",
    "company_id",
    "name",
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "is_primary",
  ] as const;

  const { data, error } = await supabase
    .from("company_locations")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<InferredType<LocationDatabaseRow, (typeof columns)[number]>[]>();

  let supabaseError = null;
  if (error) {
    console.error(error);
    supabaseError = error;
  }
  else if (!data?.length) {
    supabaseError = { message: "No locations found" };
  }

  return { data, error: supabaseError };
}

export async function getLocationById({
  supabase,
  id
}: { supabase: TypedSupabaseClient; id: string; }) {
  const columns = [
    "id",
    "company_id",
    "name",
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "is_primary",
  ] as const;

  const { data, error } = await supabase
    .from("company_locations")
    .select(columns.join(","))
    .eq("id", id)
    .single<InferredType<LocationDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

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
  const columns = [
    "id",
    "parent_company_id",
    "child_company_id",
    "relationship_type",
    "start_date",
    "end_date",
    "terms",
    "is_active",
    "parent_company:companies!parent_company_id (id, name)",
    "child_company:companies!child_company_id (id, name)",
  ] as const;

  const { data, error } = await supabase
    .from("company_relationships")
    .select(columns.join(","))
    .or(`parent_company_id.eq.${companyId},child_company_id.eq.${companyId}`)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<Omit<RelationshipWithCompany, "created_at" | "updated_at">[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getRelationshipById({
  supabase,
  id,
  companyId,
}: { supabase: TypedSupabaseClient; id: string; companyId: string }) {
  const columns = [
    "id",
    "parent_company_id",
    "child_company_id",
    "relationship_type",
    "start_date",
    "end_date",
    "terms",
    "is_active",
    "parent_company:companies!parent_company_id (id, name)",
    "child_company:companies!child_company_id (id, name)",
  ] as const;

  const { data, error } = await supabase
    .from("company_relationships")
    .select(columns.join(","))
    .eq("id", id)
    .or(`parent_company_id.eq.${companyId},child_company_id.eq.${companyId}`)
    .single<Omit<RelationshipWithCompany, "created_at" | "updated_at">>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getRelationshipTermsById({
  supabase,
  id,
  companyId,
}: { supabase: TypedSupabaseClient; id: string; companyId: string }) {
  const columns = ["terms"] as const;
  const { data, error } = await supabase
    .from("company_relationships")
    .select(columns.join(","))
    .eq("id", id)
    .or(`parent_company_id.eq.${companyId},child_company_id.eq.${companyId}`)
    .single<InferredType<RelationshipDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

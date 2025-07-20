import type {
  EmployeeDatabaseRow,
  EmployeeProjectAssignmentDatabaseRow,
  ProjectDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT } from "../constant";

export type ImportEmployeeProjectAssignmentsDataType = Pick<
  EmployeeProjectAssignmentDatabaseRow,
  | "position"
  | "assignment_type"
  | "start_date"
  | "end_date"
  | "skill_level"
  | "probation_period"
  | "probation_end_date"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
  site: string;
};

// Projects
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
    "description",
    "project_code",
    "project_type",
    "start_date",
    "end_date",
    "status",
    "company_id"
  ] as const;

  const { data, error } = await supabase
    .from("projects")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<Omit<ProjectDatabaseRow, "created_at" | "updated_at">[]>();

  if (error) {
    console.error("getProjectsByCompanyId Error", error);
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
    .select("id, name")
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<{ id: string; name: string }[]>();

  if (error) {
    console.error("getProjectNamesByCompanyId Error", error);
  }

  return { data, error };
}

export async function getProjectById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "name",
    "description",
    "project_code",
    "project_type",
    "start_date",
    "end_date",
    "status",
    "company_id"
  ] as const;

  const { data, error } = await supabase
    .from("projects")
    .select(columns.join(","))
    .eq("id", id)
    .single<Omit<ProjectDatabaseRow, "created_at" | "updated_at">>();

  if (error) {
    console.error("getProjectById Error", error);
  }

  return { data, error };
}
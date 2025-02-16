import type {
  EmployeeDatabaseRow,
  EmployeeLetterDatabaseRow,
  EmployeeProjectAssignmentDatabaseRow,
  InferredType,
  SiteDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export type GetEmployeeLettersByCompanyIdParams = {
  sort?: [string, "asc" | "desc"];
  searchQuery?: string;
};

export type EmployeeLetterDataType = Pick<
  EmployeeLetterDatabaseRow,
  "id" | "employee_id" | "subject" | "letter_type" | "date"
>;

export async function getEmployeeLettersByEmployeeId({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "letter_type",
    "subject",
    "date",
  ] as const;

  const { data, error } = await supabase
    .from("employee_letter")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .returns<
      InferredType<EmployeeLetterDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error("getEmployeeLettersByEmployeeId Error", error);
    return { data: null, error };
  }

  return {
    data,
    error: null,
  };
}

export async function getEmployeeLetterById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "letter_type",
    "subject",
    "date",
    "content",
    "include_client_address",
    "include_employee_address",
    "include_our_address",
    "include_letter_head",
    "include_signatuory",
    "include_employee_signature",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_letter")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<EmployeeLetterDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getEmployeeLetterById Error", error);
    return { data: null, error };
  }

  return { data, error };
}

export type EmployeeWithLetterDataType = Omit<
  EmployeeLetterDatabaseRow,
  "created_at" | "updated_at"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    "first_name" | "middle_name" | "last_name" | "gender" | "personal_email"
  > & {
    employee_project_assignment: Pick<
      EmployeeProjectAssignmentDatabaseRow,
      | "employee_id"
      | "assignment_type"
      | "skill_level"
      | "position"
      | "start_date"
      | "end_date"
    > & {
      project_sites: Pick<SiteDatabaseRow, "id" | "name">;
    };
  };
};

export async function getEmployeeLetterWithEmployeeById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "letter_type",
    "subject",
    "date",
    "content",
    "include_client_address",
    "include_employee_address",
    "include_our_address",
    "include_letter_head",
    "include_signatuory",
    "include_employee_signature",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_letter")
    .select(
      `${columns.join(",")}, employees(first_name, middle_name, last_name, gender, personal_email, employee_project_assignment!employee_project_assignments_employee_id_fkey!left(
        employee_id, assignment_type, skill_level, position, start_date, end_date,
        project_sites!left(id, name)
      ))`,
    )
    .eq("id", id)
    .order("created_at", { ascending: false })
    .single<EmployeeWithLetterDataType>();

  if (error) {
    console.error("getEmployeeLetterWithEmployeeById Error", error);
  }

  return { data, error };
}

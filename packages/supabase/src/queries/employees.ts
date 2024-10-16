import type { EmployeeDatabaseRow, TypedSupabaseClient } from "../types";

export type GetEmployeesByCompanyIdParams = {
  to: number;
  from: number;
  sort?: [string, "asc" | "desc"];
  searchQuery?: string;
  filter?: {
    start?: string;
    end?: string;
  };
};

export type EmployeeDataType = Pick<
  EmployeeDatabaseRow,
  | "id"
  | "employee_code"
  | "first_name"
  | "middle_name"
  | "last_name"
  | "date_of_birth"
  | "primary_mobile_number"
  | "education"
  | "is_active"
  | "gender"
>;

export async function getEmployeesByCompanyId({
  supabase,
  companyId,
  params,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  params: GetEmployeesByCompanyIdParams;
}) {
  const { sort, from, to } = params;

  const columns = [
    "id",
    "employee_code",
    "first_name",
    "middle_name",
    "last_name",
    "date_of_birth",
    "education",
    "primary_mobile_number",
    "is_active",
    "gender",
  ] as const;

  const query = supabase
    .from("employees")
    .select(columns.join(","), { count: "exact" })
    .eq("company_id", companyId);

  if (sort) {
    const [column, value] = sort;
    const ascending = value === "asc";

    if (column === "employee_code") {
      query.order("employee_code", { ascending });
    } else if (column === "full_name") {
      query.order("first_name", { ascending });
    } else if (column === "mobile_number") {
      query.order("primary_mobile_number", { ascending });
    } else if (column === "date_of_birth") {
      query.order("date_of_birth", { ascending });
    } else if (column === "education") {
      query.order("education", { ascending });
    } else if (column === "gender") {
      query.order("gender", { ascending });
    } else if (column === "status") {
      query.order("status", { ascending });
    } else {
      query.order(column, { ascending });
    }
  } else {
    query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query
    .range(from, to)
    .returns<EmployeeDataType[]>();

  if (error) {
    console.error(error);
  }

  return {
    data,
    meta: {
      count: count ?? data?.length,
    },
    error,
  };
}

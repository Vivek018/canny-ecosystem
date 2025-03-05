import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  EmployeeDatabaseRow,
  EmployeeProjectAssignmentDatabaseRow,
  InferredType,
  ProjectDatabaseRow,
  ReimbursementRow,
  SiteDatabaseRow,
  TypedSupabaseClient,
  UserDatabaseRow,
} from "../types";
import { RECENT_QUERY_LIMIT } from "../constant";

export type ImportReimbursementDataType = Pick<
  ReimbursementRow,
  "amount" | "is_deductible" | "status" | "submitted_date"
> & { email: UserDatabaseRow["email"] } & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export type ReimbursementDataType = Pick<
  ReimbursementRow,
  | "id"
  | "employee_id"
  | "company_id"
  | "is_deductible"
  | "status"
  | "amount"
  | "submitted_date"
  | "user_id"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    "id" | "first_name" | "middle_name" | "last_name" | "employee_code"
  > & {
    employee_project_assignment: Pick<
      EmployeeProjectAssignmentDatabaseRow,
      "employee_id"
    > & {
      project_sites: {
        id: SiteDatabaseRow["id"];
        name: SiteDatabaseRow["name"];
        projects: {
          id: ProjectDatabaseRow["id"];
          name: ProjectDatabaseRow["name"];
        };
      };
    };
  };
} & {
  users: Pick<UserDatabaseRow, "id" | "email">;
};

export async function getReimbursementsByCompanyId({
  supabase,
  companyId,
  params,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  params: {
    from: number;
    to: number;
    sort?: [string, "asc" | "desc"];
    searchQuery?: string;
    filters?: ReimbursementFilters | null;
  };
}) {
  const { from, to, sort, searchQuery, filters } = params;

  const {
    submitted_date_start,
    submitted_date_end,
    status,
    is_deductible,
    users,
    project,
    project_site,
  } = filters ?? {};

  const columns = [
    "id",
    "company_id",
    "is_deductible",
    "status",
    "amount",
    "submitted_date",
  ] as const;

  const query = supabase
    .from("reimbursements")
    .select(
      `${columns.join(",")},
          employees!inner(first_name, middle_name, last_name, employee_code, employee_project_assignment!employee_project_assignments_employee_id_fkey!${
            project ? "inner" : "left"
          }(project_sites!${project ? "inner" : "left"}(id, name, projects!${
            project ? "inner" : "left"
          }(id, name)))),
          users!${users ? "inner" : "left"}(id,email)`,
      { count: "exact" },
    )
    .eq("company_id", companyId);

  if (sort) {
    const [column, direction] = sort;
    query.order(column, { ascending: direction === "asc" });
  } else {
    query.order("created_at", { ascending: false });
  }

  if (searchQuery) {
    const searchQueryArray = searchQuery.split(" ");
    if (searchQueryArray?.length > 0 && searchQueryArray?.length <= 3) {
      for (const searchQueryElement of searchQueryArray) {
        query.or(
          `first_name.ilike.*${searchQueryElement}*,middle_name.ilike.*${searchQueryElement}*,last_name.ilike.*${searchQueryElement}*,employee_code.ilike.*${searchQueryElement}*`,
          {
            referencedTable: "employees",
          },
        );
      }
    } else {
      query.or(
        `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*,employee_code.ilike.*${searchQuery}*`,
        {
          referencedTable: "employees",
        },
      );
    }
  }

  const dateFilters = [
    {
      field: "submitted_date",
      start: submitted_date_start,
      end: submitted_date_end,
    },
  ];
  for (const { field, start, end } of dateFilters) {
    if (start) query.gte(field, formatUTCDate(start));
    if (end) query.lte(field, formatUTCDate(end));
  }
  if (status) {
    query.eq("status", status.toLowerCase());
  }
  if (is_deductible) {
    query.eq("is_deductible", Boolean(is_deductible));
  }
  if (users) {
    query.eq("users.email", users);
  }
  if (project) {
    query.eq(
      "employees.employee_project_assignment.project_sites.projects.name",
      project,
    );
  }
  if (project_site) {
    query.eq(
      "employees.employee_project_assignment.project_sites.name",
      project_site,
    );
  }
  if (users) {
    query.eq("users.email", users);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getReimbursementsByCompanyId Error", error);
  }

  return { data, meta: { count: count ?? data?.length }, error };
}

export async function getReimbursementsById({
  supabase,
  reimbursementId,
}: {
  supabase: TypedSupabaseClient;
  reimbursementId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "company_id",
    "is_deductible",
    "status",
    "amount",
    "submitted_date",
    "user_id",
  ] as const;

  const { data, error } = await supabase
    .from("reimbursements")
    .select(columns.join(","))
    .eq("id", reimbursementId)
    .single<InferredType<ReimbursementRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getReimbursementsById Error", error);
  }

  return { data, error };
}

export type ReimbursementFilters = {
  submitted_date_start?: string | undefined | null;
  submitted_date_end?: string | undefined | null;
  status?: string | undefined | null;
  is_deductible?: string | undefined | null;
  users?: string | undefined | null;
  name?: string | undefined | null;
  project?: string | undefined | null;
  project_site?: string | undefined | null;
};

export async function getReimbursementsByEmployeeId({
  supabase,
  employeeId,
  params,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  params: {
    from: number;
    to: number;
    sort?: [string, "asc" | "desc"];
    searchQuery?: string;
    filters?: ReimbursementFilters | null;
  };
}) {
  const { from, to, sort, filters } = params;

  const {
    submitted_date_start,
    submitted_date_end,
    status,
    is_deductible,
    users,
  } = filters ?? {};

  const columns = [
    "id",
    "company_id",
    "is_deductible",
    "status",
    "amount",
    "submitted_date",
  ] as const;

  const query = supabase
    .from("reimbursements")
    .select(
      `
        ${columns.join(",")},
          employees!inner(id, first_name, middle_name, last_name, employee_code, employee_project_assignment!employee_project_assignments_employee_id_fkey!left(project_sites!left(id, name, projects!left(id, name)))),
          users!${users ? "inner" : "left"}(id,email)`,
      { count: "exact" },
    )
    .eq("employee_id", employeeId);

  if (sort) {
    const [column, direction] = sort;
    query.order(column, { ascending: direction === "asc" });
  } else {
    query.order("created_at", { ascending: false });
  }

  if (filters) {
    const dateFilters = [
      {
        field: "submitted_date",
        start: submitted_date_start,
        end: submitted_date_end,
      },
    ];
    for (const { field, start, end } of dateFilters) {
      if (start) query.gte(field, formatUTCDate(start));
      if (end) query.lte(field, formatUTCDate(end));
    }
    if (status) {
      query.eq("status", status.toLowerCase());
    }
    if (is_deductible) {
      query.eq("is_deductible", Boolean(is_deductible));
    }
    if (users) {
      query.eq("users.email", users);
    }
  }
  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getReimbursementsByEmployeeId Error", error);
  }

  return { data, meta: { count: count ?? data?.length }, error };
}

export type RecentReimbursementType = Pick<
  ReimbursementRow,
  "id" | "amount" | "status" | "submitted_date"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    "id" | "first_name" | "middle_name" | "last_name" | "employee_code"
  > & {};
};
export async function getRecentReimbursementsByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "is_deductible",
    "status",
    "amount",
    "submitted_date",
  ] as const;

  const { data, error } = await supabase
    .from("reimbursements")
    .select(
      `${columns.join(",")},
        employees!inner(id, first_name, middle_name, last_name, employee_code)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(RECENT_QUERY_LIMIT)
    .eq("company_id", companyId)
    .returns<RecentReimbursementType[]>();

  if (error) {
    console.error("getRecentReimbursementsByCompanyId Error", error);
  }

  return {
    data,
    error,
  };
}

import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  EmployeeDatabaseRow,
  EmployeeProjectAssignmentDatabaseRow,
  InferredType,
  LeavesDatabaseRow,
  LeaveTypeDatabaseRow,
  ProjectDatabaseRow,
  SiteDatabaseRow,
  TypedSupabaseClient,
  UserDatabaseRow,
} from "../types";
import { filterComparison, HARD_QUERY_LIMIT } from "../constant";

export type ImportLeavesDataType = Pick<
  LeavesDatabaseRow,
  "start_date" | "end_date" | "reason" | "leave_type"
> & { email: UserDatabaseRow["email"] } & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export type LeavesDataType = Pick<
  LeavesDatabaseRow,
  "id" | "employee_id" | "start_date" | "end_date" | "reason" | "leave_type"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    "id" | "first_name" | "middle_name" | "last_name" | "employee_code"
  > & {
    employee_project_assignment: Pick<
      EmployeeProjectAssignmentDatabaseRow,
      "employee_id"
    > & {
      sites: {
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

export type LeavesFilters = {
  date_start?: string | undefined | null;
  date_end?: string | undefined | null;
  leave_type?: string | undefined | null;
  name?: string | undefined | null;
  project?: string | undefined | null;
  site?: string | undefined | null;
  users?: string | undefined | null;
  year?: string | undefined | null;
  recently_added?: string | undefined | null;
};

export async function getLeavesByEmployeeId({
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
    filters?: LeavesFilters | null;
  };
}) {
  const { from, to, sort, filters } = params;
  const { date_start, date_end, leave_type, users, year } = filters ?? {};

  const columns = [
    "id",
    "employee_id",
    "start_date",
    "end_date",
    "reason",
    "leave_type",
    "user_id",
  ] as const;

  const query = supabase
    .from("leaves")
    .select(
      `
        ${columns.join(",")},
        employees!inner(
          id, company_id, first_name, middle_name, last_name, employee_code,
          employee_project_assignment!employee_project_assignments_employee_id_fkey!left(
            sites!left(id, name, projects!left(id, name))
          )
        ),
        users!${users ? "inner" : "left"}(id, email)
      `,
      { count: "exact" },
    )
    .eq("employee_id", employeeId);

  const simpleSortable = ["start_date", "end_date", "reason", "leave_type"];
  if (sort) {
    const [column, direction] = sort;
    if (simpleSortable.includes(column)) {
      query.order(column, { ascending: direction === "asc" });
    } else {
      query.order("created_at", { ascending: false });
    }
  } else {
    query.order("created_at", { ascending: false });
  }

  if (filters) {
    if (date_start && date_end) {
      query.or(
        `and(start_date.lte.${formatUTCDate(date_end)},end_date.gte.${formatUTCDate(
          date_start,
        )}),` +
          `and(start_date.gte.${formatUTCDate(
            date_start,
          )},start_date.lte.${formatUTCDate(date_end)},end_date.is.null)`,
      );
    }

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query.or(`and(start_date.lte.${endDate}, end_date.gte.${startDate})`);
    }

    if (leave_type) {
      query.eq("leave_type", leave_type.toLowerCase() as any);
    }

    if (users) {
      query.eq("users.email", users);
    }
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("getLeavesByEmployeeId Error", error);
  }

  return { data, meta: { count }, error };
}

export async function getLeavesById({
  supabase,
  leaveId,
}: {
  supabase: TypedSupabaseClient;
  leaveId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "start_date",
    "end_date",
    "leave_type",
    "reason",
    "user_id",
  ] as const;

  const { data, error } = await supabase
    .from("leaves")
    .select(columns.join(","))
    .eq("id", leaveId)
    .single<InferredType<LeavesDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getLeavesById Error", error);
  }

  return { data, error };
}

export async function getLeavesByCompanyId({
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
    filters?: LeavesFilters | null;
  };
}) {
  const { from, to, sort, filters } = params;
  const {
    date_start,
    date_end,
    leave_type,
    project,
    site,
    users,
    year,
    recently_added,
  } = filters ?? {};
  const foreignFilters = project || site;

  const columns = [
    "id",
    "employee_id",
    "start_date",
    "end_date",
    "reason",
    "leave_type",
  ] as const;

  const query = supabase
    .from("leaves")
    .select(
      `
        ${columns.join(",")},
        employees!inner(
          id, company_id, first_name, middle_name, last_name, employee_code,
          employee_project_assignment!employee_project_assignments_employee_id_fkey!${
            foreignFilters ? "inner" : "left"
          }(
            sites!${foreignFilters ? "inner" : "left"}(
              id, name, 
              projects!${project ? "inner" : "left"}(id, name)
            )
          )
        ),
        users!${users ? "inner" : "left"}(id,email)
      `,
      { count: "exact" },
    )
    .eq("employees.company_id", companyId);

  if (sort) {
    const simpleSortable = ["start_date", "end_date", "reason", "leave_type"];
    const [column, direction] = sort;
    if (simpleSortable.includes(column)) {
      query.order(column, { ascending: direction === "asc" });
    } else {
      query.order("created_at", { ascending: false });
    }
  } else {
    query.order("created_at", { ascending: false });
  }

  if (filters) {
    if (date_start && date_end) {
      query.or(
        `and(start_date.lte.${formatUTCDate(date_end)},end_date.gte.${formatUTCDate(
          date_start,
        )}),` +
          `and(start_date.gte.${formatUTCDate(
            date_start,
          )},start_date.lte.${formatUTCDate(date_end)},end_date.is.null)`,
      );
    }

    if (recently_added) {
      const now = new Date();
      const diff =
        filterComparison[recently_added as keyof typeof filterComparison];
      if (diff) {
        const startTime = new Date(now.getTime() - diff).toISOString();
        query.gte("created_at", startTime);
      }
    }

    if (leave_type) {
      query.eq("leave_type", leave_type.toLowerCase() as any);
    }

    if (project) {
      query.eq(
        "employees.employee_project_assignment.sites.projects.name",
        project,
      );
    }

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query.or(`and(start_date.lte.${endDate}, end_date.gte.${startDate})`);
    }

    if (site) {
      query.eq("employees.employee_project_assignment.sites.name", site);
    }

    if (users) {
      query.eq("users.email", users);
    }
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("getLeavesByEmployeeId Error", error);
  }

  if (sort && data) {
    const [column, direction] = sort;

    const getNestedValue = (leave: any) => {
      switch (column) {
        case "employee_name":
          return leave.employees?.first_name || "";
        case "employee_code":
          return leave.employees?.employee_code || "";
        case "site":
          return (
            leave.employees?.employee_project_assignment?.sites?.name || ""
          );
        case "project":
          return (
            leave.employees?.employee_project_assignment?.sites?.projects
              ?.name || ""
          );
        case "email":
          return leave.users?.email || "";
        default:
          return null;
      }
    };

    if (
      ["employee_name", "employee_code", "site", "project", "email"].includes(
        column,
      )
    ) {
      data.sort((a: any, b: any) => {
        const aValue = getNestedValue(a);
        const bValue = getNestedValue(b);
        return direction === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
  }

  return { data, meta: { count }, error };
}

export type LeaveTypeDataType = Pick<
  LeaveTypeDatabaseRow,
  "id" | "company_id" | "leave_type" | "leaves_per_year"
>;

export async function getLeaveTypeByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "leave_type",
    "leaves_per_year",
  ] as const;

  const { data, error } = await supabase
    .from("leave_type")
    .select(
      `
        ${columns.join(",")}
      `,
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: true })
    .limit(HARD_QUERY_LIMIT)
    .returns<InferredType<LeaveTypeDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getLeavesByEmployeeId Error", error);
  }

  return { data, error };
}

export async function getLeaveTypeById({
  supabase,
  leaveId,
}: {
  supabase: TypedSupabaseClient;
  leaveId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "leave_type",
    "leaves_per_year",
  ] as const;

  const { data, error } = await supabase
    .from("leave_type")
    .select(columns.join(","))
    .eq("id", leaveId)
    .single<InferredType<LeaveTypeDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getLeaveTypeById Error", error);
  }

  return { data, error };
}

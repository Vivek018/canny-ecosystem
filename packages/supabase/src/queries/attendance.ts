import { months } from "@canny_ecosystem/utils/constant";
import type {
  EmployeeAttendanceDatabaseRow,
  EmployeeDatabaseRow,
  EmployeeProjectAssignmentDatabaseRow,
  InferredType,
  ProjectDatabaseRow,
  SiteDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export type AttendanceDataType = Pick<
  EmployeeDatabaseRow,
  | "id"
  | "first_name"
  | "middle_name"
  | "last_name"
  | "employee_code"
  | "company_id"
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
} & {
  attendance: Pick<
    EmployeeAttendanceDatabaseRow,
    | "id"
    | "employee_id"
    | "date"
    | "no_of_hours"
    | "present"
    | "holiday"
    | "working_shift"
    | "holiday_type"
  >;
};

export async function getAttendanceByEmployeeId({
  supabase,
  employeeId,
  params,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  params: {
    filters?: {
      month?: string | undefined;
      year?: string | undefined;
    };
  };
}) {
  const { filters } = params;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const getLastDayOfMonth = (year: number, month: number): string => {
    const lastDay = new Date(year, month, 0).getDate();
    return lastDay.toString().padStart(2, "0");
  };

  const monthStr = currentMonth.toString().padStart(2, "0");
  const lastDay = getLastDayOfMonth(currentYear, currentMonth);

  const defaultStartDate = `${currentYear}-${monthStr}-01`;
  const defaultEndDate = `${currentYear}-${monthStr}-${lastDay}`;
  const columns = [
    "date",
    "employee_id",
    "holiday",
    "id",
    "no_of_hours",
    "present",
    "working_shift",
    "holiday_type",
  ] as const;

  let query = supabase
    .from("attendance")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .order("date", { ascending: true });

  if (!filters?.month && !filters?.year) {
    query = query
      .filter("date", "gte", defaultStartDate)
      .filter("date", "lte", defaultEndDate);
  }

  if (filters) {
    const { month, year } = filters as AttendanceFilters;

    if (month || year) {
      const monthNumber = months[month!];
      const getLastDayOfMonth = (year: number, month: number): string => {
        const lastDay = new Date(year, month, 0).getDate();
        return lastDay.toString().padStart(2, "0");
      };

      const currentYear = new Date().getFullYear();

      if (year && monthNumber) {
        const yearNum = Number(year);
        const monthStr = monthNumber.toString().padStart(2, "0");
        const lastDay = getLastDayOfMonth(yearNum, monthNumber);

        const startOfMonth = `${yearNum}-${monthStr}-01`;
        const endOfMonth = `${yearNum}-${monthStr}-${lastDay}`;

        query = query
          .filter("date", "gte", startOfMonth)
          .filter("date", "lte", endOfMonth);
      } else if (year) {
        const yearNum = Number(year);
        query = query
          .filter("date", "gte", `${yearNum}-01-01`)
          .filter("date", "lte", `${yearNum}-12-31`);
      } else if (monthNumber) {
        const monthStr = monthNumber.toString().padStart(2, "0");
        const lastDay = getLastDayOfMonth(currentYear, monthNumber);

        const startOfMonth = `${currentYear}-${monthStr}-01`;
        const endOfMonth = `${currentYear}-${monthStr}-${lastDay}`;

        query = query
          .filter("date", "gte", startOfMonth)
          .filter("date", "lte", endOfMonth);
      }
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("getAttendanceByEmployeeId Error", error);
  }

  return { data, error };
}

export async function getAttendanceByEmployeeIdAndDate({
  supabase,
  employeeId,
  date,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  date: string;
}) {
  const columns = [
    "date",
    "employee_id",
    "holiday",
    "no_of_hours",
    "present",
    "working_shift",
    "holiday_type",
  ] as const;

  const { data, error } = await supabase
    .from("attendance")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .eq("date", date)
    .single<
      InferredType<EmployeeAttendanceDatabaseRow, (typeof columns)[number]>
    >();
  if (error) console.error("getAttendanceByEmployeeIdAndDate Error", error);

  return { data, error };
}

export type AttendanceFilters = {
  month?: string | undefined | null;
  year?: string | undefined | null;
  project?: string | undefined | null;
  project_site?: string | undefined | null;
};

export async function getAttendanceByCompanyId({
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
    filters?: {
      month?: string | undefined;
      year?: string | undefined;
      project?: string | undefined;
      project_site?: string | undefined;
    };
  };
}) {
  const { from, to, sort, searchQuery, filters } = params;
  const { month, year, project, project_site } = filters ?? {};

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const getLastDayOfMonth = (year: number, month: number): string => {
    const lastDay = new Date(year, month, 0).getDate();
    return lastDay.toString().padStart(2, "0");
  };

  const monthStr = currentMonth.toString().padStart(2, "0");
  const lastDay = getLastDayOfMonth(currentYear, currentMonth);

  const defaultStartDate = `${currentYear}-${monthStr}-01`;
  const defaultEndDate = `${currentYear}-${monthStr}-${lastDay}`;

  const columns = [
    "id",
    "first_name",
    "middle_name",
    "last_name",
    "employee_code",
    "company_id",
  ] as const;

  let query = supabase
    .from("employees")
    .select(
      `
      ${columns.join(",")},
      employee_project_assignment!employee_project_assignments_employee_id_fkey!${project ? "inner" : "left"
      }(
        project_sites!${project ? "inner" : "left"}(id, name, projects!${project ? "inner" : "left"
      }(id, name))),
      attendance(
        id,
        date,
        holiday,
        present,
        employee_id,
        no_of_hours,
        holiday_type,
        working_shift
      )
    `,
      { count: "exact" }
    )
    .eq("company_id", companyId);

  if (!filters?.month && !filters?.year) {
    query = query
      .filter("attendance.date", "gte", defaultStartDate)
      .filter("attendance.date", "lte", defaultEndDate);
  }

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
        query = query.or(
          `or(first_name.ilike.%${searchQueryElement}%,middle_name.ilike.%${searchQueryElement}%,last_name.ilike.%${searchQueryElement}%,employee_code.ilike.%${searchQueryElement}%)`
        );
      }
    } else {
      query = query.or(
        `or(first_name.ilike.%${searchQuery}%,middle_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,employee_code.ilike.%${searchQuery}%)`
      );
    }
  }

  if (project) {
    query = query.eq(
      "employee_project_assignment.project_sites.projects.name",
      project
    );
  }

  if (project_site) {
    query = query.filter(
      "employee_project_assignment.project_sites.name",
      "eq",
      project_site
    );
  }

  if (month || year) {
    const monthNumber = months[month!];
    const getLastDayOfMonth = (year: number, month: number): string => {
      const lastDay = new Date(year, month, 0).getDate();
      return lastDay.toString().padStart(2, "0");
    };

    const currentYear = new Date().getFullYear();

    if (year && monthNumber) {
      const yearNum = Number(year);
      const monthStr = monthNumber.toString().padStart(2, "0");
      const lastDay = getLastDayOfMonth(yearNum, monthNumber);

      const startOfMonth = `${yearNum}-${monthStr}-01`;
      const endOfMonth = `${yearNum}-${monthStr}-${lastDay}`;

      query = query
        .filter("attendance.date", "gte", startOfMonth)
        .filter("attendance.date", "lte", endOfMonth);
    } else if (year) {
      const yearNum = Number(year);
      query = query
        .filter("attendance.date", "gte", `${yearNum}-01-01`)
        .filter("attendance.date", "lte", `${yearNum}-12-31`);
    } else if (monthNumber) {
      const monthStr = monthNumber.toString().padStart(2, "0");
      const lastDay = getLastDayOfMonth(currentYear, monthNumber);

      const startOfMonth = `${currentYear}-${monthStr}-01`;
      const endOfMonth = `${currentYear}-${monthStr}-${lastDay}`;

      query = query
        .filter("attendance.date", "gte", startOfMonth)
        .filter("attendance.date", "lte", endOfMonth);
    }
  }

  const { data, error } = await query.range(from, to);
  if (error) {
    console.error("getAttendanceByCompanyId Error", error);
  }

  return { data, error };
}

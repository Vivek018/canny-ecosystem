import { months } from "@canny_ecosystem/utils/constant";
import type {
  EmployeeDatabaseRow,
  EmployeeMonthlyAttendanceDatabaseRow,
  EmployeeProjectAssignmentDatabaseRow,
  InferredType,
  ProjectDatabaseRow,
  SiteDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import {
  defaultMonth,
  defaultYear,
  formatUTCDate,
} from "@canny_ecosystem/utils";
import { filterComparison } from "../constant";

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
    sites: {
      id: SiteDatabaseRow["id"];
      name: SiteDatabaseRow["name"];
      projects: {
        id: ProjectDatabaseRow["id"];
        name: ProjectDatabaseRow["name"];
      };
    };
  };
} & {
  monthly_attendance: Pick<
    EmployeeMonthlyAttendanceDatabaseRow,
    | "id"
    | "employee_id"
    | "present_days"
    | "working_hours"
    | "overtime_hours"
    | "month"
    | "year"
    | "working_days"
    | "absent_days"
    | "paid_holidays"
    | "casual_leaves"
    | "paid_leaves"
  >;
};

export type AttendanceReportDataType = Pick<
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
} & {
    attendance: Pick<
      EmployeeMonthlyAttendanceDatabaseRow,
      "id" | "employee_id" | "working_days" | "present_days"
    >;
  }[];

export async function getAttendanceById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "month",
    "year",
    "working_days",
    "present_days",
    "absent_days",
    "overtime_hours",
    "working_hours",
    "paid_holidays",
    "paid_leaves",
    "casual_leaves",
  ] as const;

  const { data, error } = await supabase
    .from("monthly_attendance")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<
        EmployeeMonthlyAttendanceDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) {
    console.error("getAttendanceById Error", error);
  }

  return { data, error };
}

export async function getAttendanceByEmployeeId({
  supabase,
  employeeId,
  filters,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  filters: { year: string | undefined };
}) {
  const filterYear = filters?.year ? Number(filters.year) : defaultYear;

  const columns = [
    "id",
    "employee_id",
    "month",
    "year",
    "working_days",
    "present_days",
    "absent_days",
    "overtime_hours",
    "working_hours",
    "paid_holidays",
    "paid_leaves",
    "casual_leaves",
  ] as const;

  const { data, error } = await supabase
    .from("monthly_attendance")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .eq("year", filterYear)
    .gte("month", 1)
    .lte("month", 12)
    .returns<EmployeeMonthlyAttendanceDatabaseRow[]>();

  if (error) {
    console.error("getAttendanceByEmployeeId Error", error);
  }

  return { data, error };
}

export type AttendanceFilters = {
  month?: string | undefined | null;
  year?: string | undefined | null;
  project?: string | undefined | null;
  site?: string | undefined | null;
  recently_added?: string | undefined | null;
};

export async function getMonthlyAttendanceByCompanyId({
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
    filters?: AttendanceFilters;
  };
}) {
  const { from, to, sort, searchQuery, filters } = params;
  const { month, year, project, site, recently_added } = filters ?? {};
  const foreignFilters = project || site;

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
      employee_project_assignment!employee_project_assignments_employee_id_fkey!${
        foreignFilters ? "inner" : "left"
      }(
        sites!${foreignFilters ? "inner" : "left"}(
          id,
          name,
          projects!${project ? "inner" : "left"}(id, name)
        )
      ),
      monthly_attendance:monthly_attendance!inner(
        id,
        present_days,
        working_hours,
        overtime_hours,
        month,
        year,
        working_days,
        absent_days,
        paid_holidays,
        paid_leaves,
        casual_leaves
      )
    `,
      { count: "exact" },
    )
    .eq("company_id", companyId);

  if (searchQuery) {
    const searchQueryArray = searchQuery.split(" ");
    if (searchQueryArray.length > 0 && searchQueryArray.length <= 3) {
      for (const element of searchQueryArray) {
        query = query.or(
          `or(first_name.ilike.%${element}%,middle_name.ilike.%${element}%,last_name.ilike.%${element}%,employee_code.ilike.%${element}%)`,
        );
      }
    } else {
      query = query.or(
        `or(first_name.ilike.%${searchQuery}%,middle_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,employee_code.ilike.%${searchQuery}%)`,
      );
    }
  }

  const effectiveMonth = month ? Number(months[month]) : defaultMonth;
  const effectiveYear = year ? Number(year) : defaultYear;
  query = query
    .eq("monthly_attendance.month", effectiveMonth)
    .eq("monthly_attendance.year", effectiveYear);

  // 🌐 Filters
  if (project) {
    query = query.eq(
      "employee_project_assignment.sites.projects.name",
      project,
    );
  }

  if (site) {
    query = query.eq("employee_project_assignment.sites.name", site);
  }

  if (recently_added) {
    const now = new Date();
    const diff =
      filterComparison[recently_added as keyof typeof filterComparison];
    if (diff) {
      const startTime = new Date(now.getTime() - diff).toISOString();
      query = query.gte("created_at", startTime);
    }
  }

  if (sort) {
    const [column, direction] = sort;
    if (column === "first_name") {
      query = query.order("first_name", { ascending: direction === "asc" });
    }

    if (column === "employee_code") {
      query = query.order("employee_code", { ascending: direction === "asc" });
    }
  } else {
    query = query.order("employee_code", { ascending: true });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getMonthlyAttendanceByCompanyId Error", error);
  }
  const transformedData = data?.map((employee: any) => ({
    ...employee,
    monthly_attendance: employee.monthly_attendance?.[0] ?? null,
  }));

  return {
    data: transformedData,
    meta: { count },
    error,
  };
}

export type AttendanceReportFilters = {
  start_month?: string | undefined | null;
  end_month?: string | undefined | null;
  start_year?: string | undefined | null;
  end_year?: string | undefined | null;
  project?: string | undefined | null;
  site?: string | undefined | null;
};

export async function getAttendanceReportByCompanyId({
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
    filters?: AttendanceReportFilters;
  };
}) {
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = `${currentYear}-12-31`;
  const { sort, from, to, filters, searchQuery } = params;
  const { project, site, start_year, start_month, end_year, end_month } =
    filters ?? {};
  const foreignFilters = project || site;

  const columns = [
    "id",
    "employee_code",
    "first_name",
    "middle_name",
    "last_name",
  ] as const;

  const query = supabase
    .from("employees")
    .select(
      `
      ${columns.join(",")},
      employee_project_assignment!employee_project_assignments_employee_id_fkey!${
        foreignFilters ? "inner" : "left"
      }(
        sites!${foreignFilters ? "inner" : "left"}(id, name, projects!${
          project ? "inner" : "left"
        }(id, name))),
      attendance(
        id,
        date,
        present,
        employee_id
      )
    `,
      { count: "exact" },
    )
    .eq("company_id", companyId)
    .eq("attendance.present", true)
    .gte("attendance.date", startDate)
    .lte("attendance.date", endDate);

  if (sort) {
    const [column, direction] = sort;
    if (column === "employee_name") {
      query.order("first_name", { ascending: direction === "asc" });
    } else {
      query.order(column, { ascending: direction === "asc" });
    }
  }
  if (searchQuery) {
    const searchQueryArray = searchQuery.split(" ");
    if (searchQueryArray?.length > 0 && searchQueryArray?.length <= 3) {
      for (const searchQueryElement of searchQueryArray) {
        query.or(
          `first_name.ilike.*${searchQueryElement}*,middle_name.ilike.*${searchQueryElement}*,last_name.ilike.*${searchQueryElement}*,employee_code.ilike.*${searchQueryElement}*`,
        );
      }
    } else {
      query.or(
        `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*,employee_code.ilike.*${searchQuery}*`,
      );
    }
  }
  if (start_year || end_year) {
    let endDateLastDay = 30;
    if (end_year) {
      const year = Number.parseInt(end_year, 10);
      const month = new Date(`${end_month} 1, ${end_year}`).getMonth();
      endDateLastDay = new Date(year, month + 1, 0).getDate();
    }
    const start_date = new Date(`${start_month} 1, ${start_year} 12:00:00`);
    const end_date = new Date(
      `${end_month} ${endDateLastDay}, ${end_year} 12:00:00`,
    );
    if (start_year)
      query.gte(
        "attendance.date",
        formatUTCDate(start_date.toISOString().split("T")[0]),
      );
    if (end_year)
      query.lte(
        "attendance.date",
        formatUTCDate(end_date.toISOString().split("T")[0]),
      );
  }
  if (project) {
    query.eq("employee_project_assignment.sites.projects.name", project);
  }
  if (site) {
    query.eq("employee_project_assignment.sites.name", site);
  }

  const { data, count, error } = await query
    .range(from, to)
    .returns<AttendanceReportDataType>();
  if (error) {
    console.error("getAttendanceReportByCompanyId Error", error);
    return { data: null, error };
  }

  const monthNames = Object.entries(months).reduce(
    (acc, [name, num]) => {
      acc[num] = name;
      return acc;
    },
    {} as { [key: number]: string },
  );

  const processedData = data?.map((employee) => {
    const { attendance, ...employeeInfo } = employee;
    const attendanceByMonth: Record<string, any[]> = {};

    if (Array.isArray(attendance) && attendance.length > 0) {
      for (const record of attendance) {
        if (record.date) {
          const recordDate = new Date(record.date);
          const month = monthNames[recordDate.getMonth() + 1];
          const year = recordDate.getFullYear();
          const monthYearKey = `${month} ${year}`;

          if (!attendanceByMonth[monthYearKey]) {
            attendanceByMonth[monthYearKey] = [];
          }

          attendanceByMonth[monthYearKey].push(record);
        }
      }
    }

    return {
      ...employeeInfo,
      attendance: attendanceByMonth,
    };
  });

  return {
    data: processedData,
    meta: { count: count },
    error: null,
  };
}

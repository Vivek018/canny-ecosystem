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
import { defaultYear, formatUTCDate } from "@canny_ecosystem/utils";

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

export type AttendanceReportDataType = Pick<
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
} & {
  attendance: Pick<
    EmployeeAttendanceDatabaseRow,
    "id" | "employee_id" | "date" | "present"
  >;
}[];

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

  const monthStr = (currentMonth - 1).toString().padStart(2, "0");
  const lastDay = getLastDayOfMonth(currentYear, currentMonth - 1);

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
        const lastDay = getLastDayOfMonth(defaultYear, monthNumber);

        const startOfMonth = `${defaultYear}-${monthStr}-01`;
        const endOfMonth = `${defaultYear}-${monthStr}-${lastDay}`;

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
  range?: string | undefined | null;
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
    filters?: AttendanceFilters;
  };
}) {
  const { from, to, sort, searchQuery, filters } = params;
  const { month, year, project, project_site, range } = filters ?? {};

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const getLastDayOfMonth = (year: number, month: number): string => {
    const lastDay = new Date(year, month, 0).getDate();
    return lastDay.toString().padStart(2, "0");
  };

  let startDate: string;
  let endDate: string;

  function isValidDate(year: number, month: number, day: number): boolean {
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  if (range) {
    let endDateObj: Date;
    let startDateObj: Date;
    const rangeNumber = Number.parseInt(String(range), 10);

    if (!Number.isNaN(rangeNumber) && rangeNumber > 0) {
      if (month) {
        const monthNumber = months[month];
        if (year) {
          if (!isValidDate(Number(year), monthNumber, rangeNumber)) {
            endDateObj = new Date(Number(year), monthNumber, 0, 24);
          } else {
            endDateObj = new Date(
              Number(year),
              monthNumber - 1,
              rangeNumber + 1
            );
          }

          let targetMonth = monthNumber - 2;
          let targetYear = Number(year);

          if (targetMonth < 0) {
            targetMonth = 11;
            targetYear -= 1;
          }
          if (!isValidDate(targetYear, targetMonth + 1, rangeNumber)) {
            startDateObj = new Date(targetYear, targetMonth + 1, 1, 24);
          } else {
            startDateObj = new Date(targetYear, targetMonth, rangeNumber + 2);
          }
        } else {
          if (!isValidDate(currentYear, monthNumber, rangeNumber)) {
            endDateObj = new Date(currentYear, monthNumber, 0, 24);
          } else {
            endDateObj = new Date(
              currentDate.getFullYear(),
              monthNumber - 1,
              rangeNumber + 1
            );
          }

          let targetMonth = monthNumber - 2;
          let targetYear = currentDate.getFullYear();

          if (targetMonth < 0) {
            targetMonth = 11;
            targetYear -= 1;
          }
          if (!isValidDate(targetYear, targetMonth + 1, rangeNumber)) {
            startDateObj = new Date(targetYear, targetMonth + 1, 1, 24);
          } else {
            startDateObj = new Date(targetYear, targetMonth, rangeNumber + 2);
          }
        }
      } else if (year) {
        if (
          !isValidDate(Number(year), currentDate.getMonth() + 1, rangeNumber)
        ) {
          endDateObj = new Date(
            Number(year),
            currentDate.getMonth() + 1,
            0,
            24
          );
        } else {
          endDateObj = new Date(
            Number(year),
            currentDate.getMonth(),
            rangeNumber + 1
          );
        }

        let targetMonth = currentDate.getMonth() - 1;
        let targetYear = Number(year);

        if (targetMonth < 0) {
          targetMonth = 11;
          targetYear -= 1;
        }
        if (!isValidDate(targetYear, targetMonth + 1, rangeNumber)) {
          startDateObj = new Date(targetYear, targetMonth + 1, 1, 24);
        } else {
          startDateObj = new Date(targetYear, targetMonth, rangeNumber + 2);
        }
      } else {
        const targetDate = currentDate.getDate();
        let targetMonth = currentDate.getMonth() - 1;
        let targetYear = currentDate.getFullYear();
        if (targetMonth < 0) {
          targetMonth = 11;
          targetYear -= 1;
        }

        if (targetDate > rangeNumber) {
          endDateObj = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            rangeNumber + 1
          );

          if (!isValidDate(targetYear, targetMonth + 1, rangeNumber)) {
            startDateObj = new Date(targetYear, targetMonth + 1, 1, 24);
          } else {
            startDateObj = new Date(targetYear, targetMonth, rangeNumber + 2);
          }
        } else {
          if (
            !isValidDate(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              rangeNumber
            )
          ) {
            endDateObj = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              0,
              24
            );
          } else {
            endDateObj = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() - 1,
              rangeNumber + 1
            );
          }

          if (!isValidDate(targetYear, targetMonth, rangeNumber)) {
            startDateObj = new Date(targetYear, targetMonth, 1, 24);
          } else {
            startDateObj = new Date(
              targetYear,
              targetMonth - 1,
              rangeNumber + 2
            );
          }
        }
      }

      endDate = endDateObj.toISOString().split("T")[0];
      startDate = startDateObj?.toISOString().split("T")[0];
    } else {
      const monthStr = currentMonth.toString().padStart(2, "0");
      const lastDay = getLastDayOfMonth(currentYear, currentMonth);
      startDate = `${currentYear}-${monthStr}-01`;
      endDate = `${currentYear}-${monthStr}-${lastDay}`;
    }
  } else if (month || year) {
    const monthNumber = months[month!];

    if (year && monthNumber) {
      const yearNum = Number(year);
      const monthStr = monthNumber.toString().padStart(2, "0");
      const lastDay = getLastDayOfMonth(yearNum, monthNumber);

      startDate = `${yearNum}-${monthStr}-01`;
      endDate = `${yearNum}-${monthStr}-${lastDay}`;
    } else if (year) {
      const lastDay = getLastDayOfMonth(Number(year), currentMonth);
      const yearNum = Number(year);
      startDate = `${yearNum}-${currentMonth}-01`;
      endDate = `${yearNum}-${currentMonth}-${lastDay}`;
    } else if (monthNumber) {
      const monthStr = monthNumber.toString().padStart(2, "0");
      const lastDay = getLastDayOfMonth(currentYear, monthNumber);

      startDate = `${currentYear}-${monthStr}-01`;
      endDate = `${currentYear}-${monthStr}-${lastDay}`;
    } else {
      const monthStr = currentMonth.toString().padStart(2, "0");
      const lastDay = getLastDayOfMonth(currentYear, currentMonth);
      startDate = `${currentYear}-${monthStr}-01`;
      endDate = `${currentYear}-${monthStr}-${lastDay}`;
    }
  } else {
    const monthStr = (currentMonth - 1).toString().padStart(2, "0");
    const lastDay = getLastDayOfMonth(currentYear, currentMonth - 1);
    startDate = `${currentYear}-${monthStr}-01`;
    endDate = `${currentYear}-${monthStr}-${lastDay}`;
  }

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

  // Apply date filters
  query = query
    .filter("attendance.date", "gte", startDate)
    .filter("attendance.date", "lte", endDate);

  if (sort) {
    const [column, direction] = sort;
    query.order(column, { ascending: direction === "asc" });
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
    query = query.eq(
      "employee_project_assignment.project_sites.name",
      project_site
    );
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("getAttendanceByCompanyId Error", error);
  }

  return {
    data,
    meta: { count: count },
    error,
    dateRange: { startDate, endDate },
  };
}

export type AttendanceReportFilters = {
  start_month?: string | undefined | null;
  end_month?: string | undefined | null;
  start_year?: string | undefined | null;
  end_year?: string | undefined | null;
  project?: string | undefined | null;
  project_site?: string | undefined | null;
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
  const {
    project,
    project_site,
    start_year,
    start_month,
    end_year,
    end_month,
  } = filters ?? {};

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
      employee_project_assignment!employee_project_assignments_employee_id_fkey!${project ? "inner" : "left"
      }(
        project_sites!${project ? "inner" : "left"}(id, name, projects!${project ? "inner" : "left"
      }(id, name))),
      attendance(
        id,
        date,
        present,
        employee_id
      )
    `,
      { count: "exact" }
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
          `first_name.ilike.*${searchQueryElement}*,middle_name.ilike.*${searchQueryElement}*,last_name.ilike.*${searchQueryElement}*,employee_code.ilike.*${searchQueryElement}*`
        );
      }
    } else {
      query.or(
        `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*,employee_code.ilike.*${searchQuery}*`
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
      `${end_month} ${endDateLastDay}, ${end_year} 12:00:00`
    );
    if (start_year)
      query.gte(
        "attendance.date",
        formatUTCDate(start_date.toISOString().split("T")[0])
      );
    if (end_year)
      query.lte(
        "attendance.date",
        formatUTCDate(end_date.toISOString().split("T")[0])
      );
  }
  if (project) {
    query.eq(
      "employee_project_assignment.project_sites.projects.name",
      project
    );
  }
  if (project_site) {
    query.eq("employee_project_assignment.project_sites.name", project_site);
  }

  const { data, count, error } = await query
    .range(from, to)
    .returns<AttendanceReportDataType>();
  if (error) {
    console.error("getAttendanceReportByCompanyId Error", error);
    return { data: null, error };
  }

  const monthNames = Object.entries(months).reduce((acc, [name, num]) => {
    acc[num] = name;
    return acc;
  }, {} as { [key: number]: string });

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

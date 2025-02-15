import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  getAttendanceByCompanyId,
  getProjectNamesByCompanyId,
  getSiteNamesByProjectName,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  json,
  redirect,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { AttendanceTable } from "@/components/attendance/table/attendance-table";
import { attendanceColumns } from "@/components/attendance/table/columns";
import { ImportAttendanceMenu } from "@/components/attendance/import-attendance-menu";
import { ImportEmployeeAttendanceModal } from "@/components/employees/import-export/import-modal-attendance";
import { FilterList } from "@/components/attendance/filter-list";
import { AttendanceSearchFilter } from "@/components/attendance/attendance-search-filter";
import { useAttendanceStore } from "@/store/attendance";
import { useEffect, useState } from "react";
import { formatDate, hasPermission, readRole } from "@canny_ecosystem/utils";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { clientCaching } from "@/utils/cache";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute, months } from "@canny_ecosystem/utils/constant";

export type TransformedAteendanceDataType = {
  projectName: any;
  attendance: never[];

  employee_id: string;
  employee_code: string;
  employee_name: string;
  project: string | null;
  project_site: string | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.attendance}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const searchParams = new URLSearchParams(url.searchParams);
  const sortParam = searchParams.get("sort");
  const query = searchParams.get("name") ?? undefined;

  const filters = {
    month: searchParams.get("month") ?? undefined,
    year: searchParams.get("year") ?? undefined,
    name: query,
    project: searchParams.get("project") ?? undefined,
    project_site: searchParams.get("project_site") ?? undefined,
  };

  const { data: attendanceData, error: attendanceError } =
    await getAttendanceByCompanyId({
      supabase,
      companyId,
      params: {
        from: 0,
        to: MAX_QUERY_LIMIT,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });
  if (attendanceError || !attendanceData) {
    throw attendanceError;
  }

  const { data: projectData } = await getProjectNamesByCompanyId({
    supabase,
    companyId,
  });

  let projectSiteData = null;
  if (filters.project) {
    const { data } = await getSiteNamesByProjectName({
      supabase,
      projectName: filters.project,
    });
    projectSiteData = data;
  }
  return json({
    attendanceData,
    filters,
    projectArray: projectData?.map((project) => project.name) ?? [],
    projectSiteArray: projectSiteData?.map((site) => site.name) ?? [],
  });
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);

  return await clientCaching(
    `${cacheKeyPrefix.attendance}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();

  const prompt = formData.get("prompt") as string | null;

  const searchParams = new URLSearchParams();
  if (prompt && prompt.trim().length > 0) {
    searchParams.append("name", prompt.trim());
  }

  url.search = searchParams.toString();

  return redirect(url.toString());
}

export default function Attendance() {
  const navigate = useNavigate();
  const { attendanceData, filters, projectArray, projectSiteArray } =
    useLoaderData<typeof loader>();

  const [data, setData] = useState<TransformedAteendanceDataType[]>([]);

  function transformAttendanceData(data: any[]) {
    const groupedByEmployeeAndMonth = data.reduce((acc, employee) => {
      const empCode = employee.employee_code;
      const employeeDetails = {
        employee_id: employee.id,
        employee_code: empCode,
        employee_name: `${employee.first_name} ${employee.middle_name} ${employee.last_name}`,
        project:
          employee.employee_project_assignment?.project_sites?.projects?.name ||
          null,
        project_site:
          employee.employee_project_assignment?.project_sites?.name || null,
      };

      if (!employee?.attendance?.length) {
        acc[empCode] = acc[empCode] || employeeDetails;
        return acc;
      }

      // biome-ignore lint/complexity/noForEach: <explanation>
      employee?.attendance?.forEach(
        (record: {
          date: string | number | Date;
          present: any;
          holiday: any;
          holiday_type: string;
        }) => {
          const date = new Date(record.date);
          const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
          const key = `${empCode}-${monthYear}`;

          if (!acc[key]) {
            acc[key] = { ...employeeDetails };
          }

          const fullDate = formatDate(date.toISOString().split("T")[0]);
          acc[key][fullDate] = record.present
            ? "P"
            : record.holiday
            ? record.holiday_type === "weekly"
              ? "(WOF)"
              : record.holiday_type === "paid"
              ? "L"
              : "A"
            : "A";
        }
      );

      return acc;
    }, {});

    return Object.values(groupedByEmployeeAndMonth);
  }

  useEffect(() => {
    setData(
      transformAttendanceData(attendanceData) as TransformedAteendanceDataType[]
    );
  }, [attendanceData]);

  const [month, setMonth] = useState<number>(() => {
    if (filters.month) {
      return months[filters.month] - 1;
    }
    return new Date().getMonth();
  });

  const [year, setYear] = useState<number>(() => {
    return filters.year ? Number(filters.year) : new Date().getFullYear();
  });

  useEffect(() => {
    if (filters.month) {
      setMonth(months[filters.month] - 1);
    } else {
      setMonth(new Date().getMonth());
    }

    if (filters.year) {
      setYear(Number(filters.year));
    } else {
      setYear(new Date().getFullYear());
    }
  }, [filters]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const currentDate = new Date(year, month, i + 1);
    currentDate.setHours(12, 0, 0, 0);
    return {
      day: i + 1,
      fullDate: currentDate.toISOString().split("T")[0],
    };
  });

  const { selectedRows } = useAttendanceStore();

  const noFilters = Object.values(filters).every((value) => !value);

  return (
    <section className="py-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <AttendanceSearchFilter
            disabled={!attendanceData?.length && noFilters}
            projectArray={projectArray}
            projectSiteArray={projectSiteArray}
            setMonth={setMonth}
            setYear={setYear}
          />
          <FilterList filters={filters} />
        </div>
        <div className="space-x-2 hidden md:flex">
          {!selectedRows.length ? (
            <ImportAttendanceMenu />
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              disabled={!selectedRows.length}
              onClick={() => navigate("/time-tracking/attendance/analytics")}
            >
              <Icon name="chart" className="h-[18px] w-[18px]" />
            </Button>
          )}
        </div>
      </div>
      <AttendanceTable
        days={days as any}
        data={data as any}
        columns={attendanceColumns(days)}
        filters={filters}
        noFilters={noFilters}
      />

      <ImportEmployeeAttendanceModal />
    </section>
  );
}

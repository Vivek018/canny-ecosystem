import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getAttendanceByCompanyId,
  getPaySequenceNameByCompanyId,
  getProjectNamesByCompanyId,
  getSiteNamesByProjectName,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { AttendanceTable } from "@/components/attendance/table/attendance-table";
import { attendanceColumns } from "@/components/attendance/table/columns";
import { ImportEmployeeAttendanceModal } from "@/components/employees/import-export/import-modal-attendance";
import { Suspense, useEffect, useMemo, useState } from "react";
import { formatDate, hasPermission, readRole } from "@canny_ecosystem/utils";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute, months } from "@canny_ecosystem/utils/constant";
import { ErrorBoundary } from "@/components/error-boundary";
import { AttendanceSearchFilter } from "@/components/attendance/attendance-search-filter";
import { FilterList } from "@/components/attendance/filter-list";
import { AttendanceActions } from "@/components/attendance/attendance-actions";
import { LoadingSpinner } from "@/components/loading-spinner";

const pageSize = LAZY_LOADING_LIMIT;

export type TransformedAttendanceDataType = {
  attendance: any[];
  employee_id: string;
  employee_code: string;
  employee_name: string;
  project: string | null;
  project_site: string | null;
};

export type DayType = {
  day: number;
  fullDate: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  try {
    const url = new URL(request.url);
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const page = 0;
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

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
        (value) => value !== null && value !== undefined
      );

    const attendancePromise = getAttendanceByCompanyId({
      supabase,
      companyId,
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });

    const projectPromise = await getProjectNamesByCompanyId({
      supabase,
      companyId,
    });

    const paySequencePromise = await getPaySequenceNameByCompanyId({
      supabase,
      companyId,
    });

    let projectSitePromise = null;
    if (filters.project) {
      projectSitePromise = getSiteNamesByProjectName({
        supabase,
        projectName: filters.project,
      });
    }
    return defer({
      projectPromise,
      paySequencePromise,
      projectSitePromise,
      attendancePromise: attendancePromise as any,
      filters,
      query,
      env,
      companyId,
    });
  } catch (error) {
    console.error("Attendance Error in loader function:", error);

    return defer({
      attendancePromise: Promise.resolve({ data: [] }),
      projectPromise: Promise.resolve({ data: [] }),
      paySequencePromise: Promise.resolve({ data: [] }),
      projectSitePromise: Promise.resolve({ data: [] }),
      query: "",
      filters: null,
      companyId: "",
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);

  return clientCaching(
    `${cacheKeyPrefix.attendance}${url.searchParams.toString()}`,
    args
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
  const {
    attendancePromise,
    projectPromise,
    projectSitePromise,
    paySequencePromise,
    query,
    filters,
    companyId,
    env,
  } = useLoaderData<typeof loader>();

  const [month, setMonth] = useState<number>(() => {
    if (filters?.month) {
      return months[filters?.month] - 1;
    }
    return new Date().getMonth();
  });

  const [year, setYear] = useState<number>(() => {
    return filters?.year ? Number(filters?.year) : new Date().getFullYear();
  });

  useEffect(() => {
    if (filters?.month) {
      setMonth(months[filters?.month] - 1);
    } else {
      setMonth(new Date().getMonth());
    }

    if (filters?.year) {
      setYear(Number(filters?.year));
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

  const transformAttendanceData = useMemo(() => {
    return (data: any[]) => {
      const groupedByEmployeeAndMonth = data.reduce((acc, employee) => {
        const empCode = employee.employee_code;
        const employeeDetails = {
          employee_id: employee.id,
          employee_code: empCode,
          employee_name: `${employee.first_name} ${employee.middle_name} ${employee.last_name}`,
          project:
            employee.employee_project_assignment?.project_sites?.projects
              ?.name || null,
          project_site:
            employee.employee_project_assignment?.project_sites?.name || null,
        };

        if (!employee?.attendance?.length) {
          acc[empCode] = acc[empCode] || employeeDetails;
          return acc;
        }

        for (const record of employee?.attendance ?? []) {
          const date = new Date(record.date);
          const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
          const key = `${empCode}-${monthYear}`;

          if (!acc[key]) {
            acc[key] = { ...employeeDetails };
          }

          const fullDate = formatDate(date.toISOString().split("T")[0]);
          acc[key][fullDate!] = record.present
            ? "P"
            : record.holiday
            ? record.holiday_type === "weekly"
              ? "(WOF)"
              : record.holiday_type === "paid"
              ? "L"
              : "A"
            : "A";
        }

        return acc;
      }, {});

      return Object.values(groupedByEmployeeAndMonth);
    };
  }, [month, year, days]);

  const noFilters = Boolean(
    filters && Object.values(filters).every((value) => !value)
  );
  return (
    <section className="py-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={projectSitePromise}>
                  {(projectSiteData) => (
                    <Await resolve={paySequencePromise}>
                      {(paySequenceData) => (
                        <AttendanceSearchFilter
                        days={days}
                          setMonth={setMonth}
                          setYear={setYear}
                          disabled={!projectData?.data?.length && noFilters}
                          projectArray={
                            projectData?.data?.length
                              ? projectData?.data?.map(
                                  (project) => project!.name
                                )
                              : []
                          }
                          projectSiteArray={
                            projectSiteData?.data?.length
                              ? projectSiteData?.data?.map((site) => site!.name)
                              : []
                          }
                          paySequenceArray={
                            paySequenceData?.data?.length
                              ? paySequenceData?.data?.map((pay) => [
                                  pay!.name,
                                  pay?.pay_day,
                                ])
                              : []
                          }
                        />
                      )}
                    </Await>
                  )}
                </Await>
              )}
            </Await>
          </Suspense>

          <FilterList filters={filters ?? undefined} />
        </div>
        <AttendanceActions />
      </div>
      <Suspense fallback={<LoadingSpinner className='w-1/3 h-1/3' />}>
        <Await resolve={attendancePromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.attendance);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load Attendance"
                />
              );
            }

            const transformedData = useMemo(() => {
              return transformAttendanceData(data);
            }, [data, transformAttendanceData]);

            const hasNextPage = Boolean(meta?.count > pageSize);

            return (
              <AttendanceTable
                days={days}
                data={
                  transformedData as unknown as TransformedAttendanceDataType[]
                }
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                query={query}
                count={meta?.count ?? data?.length ?? 0}
                columns={attendanceColumns(days)}
                filters={filters ?? undefined}
                noFilters={noFilters}
                companyId={companyId}
                env={env}
              />
            );
          }}
        </Await>
      </Suspense>

      <ImportEmployeeAttendanceModal />
    </section>
  );
}

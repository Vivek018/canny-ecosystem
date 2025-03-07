import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getAttendanceByCompanyId,
  getCompanyNameByCompanyId,
  getDefaultPaySequenceByCompanyId,
  getPaySequenceNameByCompanyId,
  getPrimaryLocationByCompanyId,
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
import { Suspense, useMemo, useState } from "react";
import {
  defaultMonth,
  defaultYear,
  formatDate,
  hasPermission,
  readRole,
} from "@canny_ecosystem/utils";
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
import type{ CompanyDatabaseRow, LocationDatabaseRow } from "@canny_ecosystem/supabase/types";

const pageSize = LAZY_LOADING_LIMIT;

export type TransformedAttendanceDataType = {
  attendance: any[];
  employee_id: string;
  employee_code: string;
  employee_name: string;
  project: string | null;
  project_site: string | null;
};

export type DayType = { day: number; fullDate: string };

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  try {
    const url = new URL(request.url);
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${readRole}:${attribute.attendance}`))
      return safeRedirect(DEFAULT_ROUTE, { headers });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const { data: companyName } = await getCompanyNameByCompanyId({
      supabase,
      id: companyId,
    });
    const { data: companyAddress } = await getPrimaryLocationByCompanyId({
      supabase,
      companyId,
    });

    const { data } = await getDefaultPaySequenceByCompanyId({
      supabase,
      companyId,
    });
    const defaultPayDay = data?.pay_day;

    const searchParams = new URLSearchParams(url.searchParams);
    const filters = {
      month: searchParams.get("month") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      name: searchParams.get("name") ?? undefined,
      project: searchParams.get("project") ?? undefined,
      project_site: searchParams.get("project_site") ?? undefined,
      range: searchParams.get("range") ?? undefined,
    };

    const hasFilters = Object.values(filters).some((value) => value);
    const attendancePromise = getAttendanceByCompanyId({
      supabase,
      companyId,
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : pageSize - 1,
        filters,
        searchQuery: filters.name,
        sort: searchParams.get("sort")?.split(":") as [string, "asc" | "desc"],
      },
    });

    const projectPromise = getProjectNamesByCompanyId({ supabase, companyId });
    const paySequencePromise = getPaySequenceNameByCompanyId({
      supabase,
      companyId,
    });
    const projectSitePromise = filters.project
      ? getSiteNamesByProjectName({ supabase, projectName: filters.project })
      : null;

    return defer({
      projectPromise,
      defaultPayDay,
      paySequencePromise,
      projectSitePromise,
      attendancePromise: attendancePromise as any,
      filters,
      companyName,
      companyAddress,
      query: filters.name,
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
      defaultPayDay: null,
      query: "",
      filters: null,
      companyId: "",
      companyName: null,
      companyAddress: null,
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.attendance}${url.searchParams.toString()}`,
    args,
  );
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string | null;
  const searchParams = new URLSearchParams();
  if (prompt?.trim()) searchParams.append("name", prompt.trim());
  url.search = searchParams.toString();
  return redirect(url.toString());
}

export default function Attendance() {
  const {
    attendancePromise,
    projectPromise,
    projectSitePromise,
    paySequencePromise,
    defaultPayDay,
    query,
    filters,
    companyId,
    companyName,
    companyAddress,
    env,
  } = useLoaderData<typeof loader>();

  const [month, setMonth] = useState<number>(
    filters?.month ? months[filters.month] - 1 : defaultMonth,
  );
  const [year, setYear] = useState<number>(
    filters?.year ? Number(filters.year) : defaultYear,
  );

  const transformAttendanceData = useMemo(
    () => (data: any[]) => {
      return Object.values(
        data.reduce(
          (acc, employee) => {
            const empCode = employee.employee_code;
            const employeeDetails = acc[empCode] || {
              employee_id: employee.id,
              employee_code: empCode,
              employee_name: `${employee.first_name} ${employee.middle_name} ${employee.last_name}`,
              project:
                employee.employee_project_assignment?.project_sites?.projects
                  ?.name || null,
              project_site:
                employee.employee_project_assignment?.project_sites?.name ||
                null,
            };

            for (const record of employee?.attendance ?? []) {
              const fullDate = formatDate(
                new Date(record.date).toISOString().split("T")[0],
              );
              employeeDetails[fullDate as string] = record.present
                ? "P"
                : record.holiday
                  ? record.holiday_type === "weekly"
                    ? "WOF"
                    : record.holiday_type === "paid"
                      ? "L"
                      : "A"
                  : "A";
            }

            acc[empCode] = employeeDetails;
            return acc;
          },
          {} as Record<string, any>,
        ),
      );
    },
    [month, year],
  );

  const noFilters = Object.values(filters ?? {}).every((value) => !value);

  return (
    <section className="py-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <Suspense fallback={<LoadingSpinner className="mt-20" />}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={projectSitePromise}>
                  {(projectSiteData) => (
                    <Await resolve={paySequencePromise}>
                      {(paySequenceData) => (
                        <AttendanceSearchFilter
                          lastDayOfMonth={new Date(
                            year,
                            month + 1,
                            0,
                          ).getDate()}
                          setMonth={setMonth}
                          setYear={setYear}
                          disabled={!projectData?.data?.length && noFilters}
                          projectArray={
                            projectData?.data?.map(
                              (project) => project!.name,
                            ) || []
                          }
                          projectSiteArray={
                            projectSiteData?.data?.map((site) => site!.name) ||
                            []
                          }
                          paySequenceArray={
                            paySequenceData?.data?.map((pay) => [
                              pay!.name!,
                              pay?.pay_day,
                            ]) || []
                          }
                          defaultPayDay={defaultPayDay}
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
        <AttendanceActions
          companyName={companyName as unknown as CompanyDatabaseRow}
          companyAddress={companyAddress as unknown as LocationDatabaseRow}
        />
      </div>
      <Suspense fallback={<LoadingSpinner className="w-1/3 h-1/3" />}>
        <Await resolve={attendancePromise}>
          {({ data, meta, error, dateRange }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.attendance);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load Attendance"
                />
              );
            }

            const days = useMemo(() => {
              if (filters?.range && dateRange) {
                const startDateObj = new Date(dateRange.startDate as string);
                const endDateObj = new Date(dateRange.endDate as string);
                return Array.from(
                  {
                    length:
                      (endDateObj.getTime() - startDateObj.getTime()) /
                        (1000 * 3600 * 24) +
                      1,
                  },
                  (_, i) => {
                    const currentDate = new Date(startDateObj);
                    currentDate.setDate(startDateObj.getDate() + i);
                    currentDate.setHours(12, 0, 0, 0);
                    return {
                      day: currentDate.getDate(),
                      fullDate: currentDate.toISOString().split("T")[0],
                    };
                  },
                );
              }
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              return Array.from({ length: daysInMonth }, (_, i) => {
                const currentDate = new Date(year, month, i + 1);

                currentDate.setHours(12, 0, 0, 0);
                return {
                  day: i + 1,
                  fullDate: currentDate.toISOString().split("T")[0],
                };
              });
            }, [filters, dateRange, month, year]);

            const transformedData = transformAttendanceData(data);

            const hasNextPage = Boolean(meta?.count > data?.length);
            return (
              <AttendanceTable
                days={days}
                data={transformedData as TransformedAttendanceDataType[]}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                query={query}
                count={meta?.count ?? 0}
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

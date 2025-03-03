import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  type AttendanceReportFilters,
  getAttendanceReportByCompanyId,
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
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { ErrorBoundary } from "@/components/error-boundary";
import { AttendanceReportSearchFilter } from "@/components/reports/attendance/report-search-filter";
import { FilterList } from "@/components/reports/attendance/filter-list";
import { columns } from "@/components/reports/attendance/table/columns";
import { DataTable } from "@/components/reports/attendance/table/data-table";
import { months } from "@canny_ecosystem/utils/constant";
import { ColumnVisibility } from "@/components/reports/column-visibility";

const pageSize = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  try {
    const url = new URL(request.url);
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");

    const query = searchParams.get("name") ?? undefined;

    const filters: AttendanceReportFilters = {
      start_month: searchParams.get("start_month") ?? undefined,
      end_month: searchParams.get("end_month") ?? undefined,
      start_year: searchParams.get("start_year") ?? undefined,
      end_year: searchParams.get("end_year") ?? undefined,
      project: searchParams.get("project") ?? undefined,
      project_site: searchParams.get("project_site") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const attendanceReportPromise = getAttendanceReportByCompanyId({
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

    const projectPromise = getProjectNamesByCompanyId({
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
      projectSitePromise,
      attendanceReportPromise: attendanceReportPromise as any,
      filters,
      query,
      env,
      companyId,
    });
  } catch (error) {
    console.error("Attendance Error in loader function:", error);

    return defer({
      attendanceReportPromise: Promise.resolve({ data: [] }),
      projectPromise: Promise.resolve({ data: [] }),
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
    `${cacheKeyPrefix.attendanceReport}${url.searchParams.toString()}`,
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

export default function AttendanceReport() {
  const {
    attendanceReportPromise,
    projectPromise,
    projectSitePromise,
    query,
    filters,
    companyId,
    env,
  } = useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="py-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <Suspense fallback={<LoadingSpinner className="mt-20" />}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={projectSitePromise}>
                  {(projectSiteData) => (
                    <AttendanceReportSearchFilter
                      disabled={!projectData?.data?.length && noFilters}
                      projectArray={
                        projectData?.data?.length
                          ? projectData?.data?.map((project) => project!.name)
                          : []
                      }
                      projectSiteArray={
                        projectSiteData?.data?.length
                          ? projectSiteData?.data?.map((site) => site!.name)
                          : []
                      }
                    />
                  )}
                </Await>
              )}
            </Await>
          </Suspense>

          <FilterList filterList={filters ?? undefined} />
        </div>
        <ColumnVisibility />
      </div>
      <Suspense fallback={<LoadingSpinner className="w-1/3 h-1/3" />}>
        <Await resolve={attendanceReportPromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.attendanceReport);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load Attendance Report"
                />
              );
            }
            function getMonthYearRange(
              startMonth: string | null | undefined,
              startYear: number,
              endMonth: string | null | undefined,
              endYear: number
            ): string[] {
              const monthYearArray: string[] = [];
              const reversedMonths = Object.entries(months).reduce(
                (acc, [name, num]) => {
                  acc[num] = name;
                  return acc;
                },
                {} as { [key: number]: string }
              );

              let currentYear = startYear;
              let currentMonth = months[startMonth!];

              while (
                currentYear < endYear ||
                (currentYear === endYear && currentMonth <= months[endMonth!])
              ) {
                monthYearArray.push(
                  `${reversedMonths[currentMonth]} ${currentYear}`
                );

                if (currentMonth === 12 && currentYear === endYear) break;

                currentMonth++;
                if (currentMonth > 12) {
                  currentMonth = 1;
                  currentYear++;
                }
              }

              return monthYearArray;
            }
            const currentYear = new Date().getFullYear();
            const monthYearsRange =
              filters?.start_year && filters?.end_year
                ? getMonthYearRange(
                    filters.start_month,
                    Number(filters.start_year),
                    filters.end_month,
                    Number(filters.end_year)
                  )
                : getMonthYearRange(
                    "January",
                    Number(currentYear),
                    "December",
                    Number(currentYear)
                  );
            const hasNextPage = Boolean(meta?.count > pageSize);
            return (
              <DataTable
                data={data}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                query={query}
                count={meta?.count ?? data?.length ?? 0}
                columns={columns(
                  monthYearsRange as any,
                  filters as AttendanceReportFilters
                )}
                filters={filters ?? undefined}
                noFilters={noFilters}
                companyId={companyId}
                env={env}
                monthYearsRange={monthYearsRange}
              />
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { LAZY_LOADING_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  getMonthlyAttendanceByCompanyId,
  getCompanyNameByCompanyId,
  getPrimaryLocationByCompanyId,
  getProjectNamesByCompanyId,
  getSiteNamesByCompanyId,
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

import { Suspense } from "react";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { ErrorBoundary } from "@/components/error-boundary";
import { AttendanceSearchFilter } from "@/components/attendance/attendance-search-filter";
import { FilterList } from "@/components/attendance/filter-list";
import { AttendanceActions } from "@/components/attendance/attendance-actions";
import { LoadingSpinner } from "@/components/loading-spinner";
import type {
  CompanyDatabaseRow,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { ImportAttendanceModal } from "@/components/employees/import-export/import-modal-attendance";
import { generateAttendanceFilter } from "@/utils/ai/attendance";

const pageSize = LAZY_LOADING_LIMIT;

export type DayType = { day: number; fullDate: string };
export type TransformedAttendanceDataType = any;

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

    const searchParams = new URLSearchParams(url.searchParams);

    const filters = {
      month: searchParams.get("month") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      name: searchParams.get("name") ?? undefined,
      project: searchParams.get("project") ?? undefined,
      site: searchParams.get("site") ?? undefined,
    };

    const attendancePromise = getMonthlyAttendanceByCompanyId({
      supabase,
      companyId,
      params: {
        from: 0,
        to: pageSize - 1,
        filters,
        searchQuery: filters.name,
        sort: searchParams.get("sort")?.split(":") as [string, "asc" | "desc"],
      },
    });

    const projectPromise = getProjectNamesByCompanyId({ supabase, companyId });

    const sitePromise = getSiteNamesByCompanyId({ supabase, companyId });


    return defer({
      projectPromise,
      sitePromise,
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
      sitePromise: Promise.resolve({ data: [] }),
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
    args
  );
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;

    const { object } = await generateAttendanceFilter({ input: prompt });

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(object)) {
      if (value !== null && value !== undefined && String(value)?.length) {
        searchParams.append(key, value.toString());
      }
    }

    url.search = searchParams.toString();

    return redirect(url.toString());
  } catch (error) {
    console.error("Attendance Error in action function:", error);

    const fallbackUrl = new URL(request.url);
    fallbackUrl.search = "";
    return redirect(fallbackUrl.toString());
  }
}

export default function Attendance() {
  const {
    attendancePromise,
    projectPromise,
    sitePromise,
    query,
    filters,
    companyId,
    companyName,
    companyAddress,
    env,
  } = useLoaderData<typeof loader>();

  const noFilters = Object.values(filters ?? {}).every((value) => !value);

  return (
    <section className="py-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <Suspense fallback={<LoadingSpinner className="mt-20" />}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={sitePromise}>
                  {(siteData) => (
                    <AttendanceSearchFilter
                      disabled={!projectData?.data?.length && noFilters}
                      projectArray={
                        projectData?.data?.map((project) => project!.name) || []
                      }
                      siteArray={
                        siteData?.data?.map((site) => site!.name) || []
                      }
                    />
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

            const hasNextPage = Boolean(meta?.count > data?.length);
            return (
              <AttendanceTable
                data={data as any[]}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                query={query}
                count={meta?.count ?? 0}
                columns={attendanceColumns}
                filters={filters ?? undefined}
                noFilters={noFilters}
                companyId={companyId}
                env={env}
              />
            );
          }}
        </Await>
      </Suspense>
      <ImportAttendanceModal />
    </section>
  );
}

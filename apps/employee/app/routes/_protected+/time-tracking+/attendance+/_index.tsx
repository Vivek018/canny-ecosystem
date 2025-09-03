import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  getCompanyNameByCompanyId,
  getPrimaryLocationByCompanyId,
  getMonthlyAttendanceBySiteIds,
  getUserByEmail,
  getSitesByLocationId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { AttendanceTable } from "@/components/attendance/table/attendance-table";
import { attendanceColumns } from "@/components/attendance/table/columns";

import { Suspense } from "react";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { ErrorBoundary } from "@/components/error-boundary";
import { AttendanceSearchFilter } from "@/components/attendance/attendance-search-filter";
import { FilterList } from "@/components/attendance/filter-list";
import { AttendanceActions } from "@/components/attendance/attendance-actions";
import { LoadingSpinner } from "@/components/loading-spinner";
import type {
  CompanyDatabaseRow,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";

const pageSize = 20;

export type DayType = { day: number; fullDate: string };

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const url = new URL(request.url);
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);
  const { data: userProfile, error: userProfileError } = await getUserByEmail({
    email: user?.email || "",
    supabase,
  });
  if (user?.role !== "location_incharge") {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  if (user?.role === "location_incharge" && !userProfile?.location_id)
    throw new Error("No location id found");

  if (userProfileError) throw userProfileError;

  try {
    const page = 0;

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
      site: searchParams.get("site") ?? undefined,
      recently_added: searchParams.get("recently_added") ?? undefined,
    };
    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const { data } = await getSitesByLocationId({
      locationId: userProfile?.location_id!,
      supabase,
    });

    const siteIdsArray = data?.map((dat) => dat.id).filter(Boolean) as string[];
    const siteOptions = data?.length ? data?.map((site) => site!.name) : [];

    const attendancePromise = getMonthlyAttendanceBySiteIds({
      supabase,
      siteIds: siteIdsArray ?? [],
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: filters.name,
        sort: searchParams.get("sort")?.split(":") as [string, "asc" | "desc"],
      },
    });

    return defer({
      attendancePromise: attendancePromise as any,
      filters,
      companyName,
      companyAddress,
      siteOptions,
      query: filters.name,
      siteIdsArray,
      env,
      companyId,
    });
  } catch (error) {
    console.error("Attendance Error in loader function:", error);
    return defer({
      attendancePromise: Promise.resolve({ data: [] }),
      defaultPayDay: null,
      query: "",
      filters: null,
      siteIdsArray: [],
      companyId: "",
      siteOptions: [],
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

export default function Attendance() {
  const {
    attendancePromise,
    query,
    filters,
    companyId,
    siteIdsArray,
    siteOptions,
    companyName,
    companyAddress,
    env,
  } = useLoaderData<typeof loader>();

  const noFilters = Object.values(filters ?? {}).every((value) => !value);

  return (
    <section className="py-4 overflow-hidden">
      <div className="w-full flex items-start md:items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mr-4">
          <AttendanceSearchFilter siteOptions={siteOptions as string[]} />
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

            const hasNextPage = Boolean(meta?.count && meta.count > pageSize);

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
                siteIdsArray={siteIdsArray as string[]}
              />
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

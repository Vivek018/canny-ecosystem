import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  type ReimbursementFilters,
  getReimbursementsBySiteIds,
  getUsersEmail,
  getUserByEmail,
  getSitesByLocationId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { ReimbursementActions } from "@/components/reimbursements/reimbursement-actions";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ReimbursementSearchFilter } from "@/components/reimbursements/reimbursement-search-filter";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import { columns } from "@/components/reimbursements/table/columns";
import { FilterList } from "@/components/reimbursements/filter-list";
import { MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
const pageSize = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
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
    const url = new URL(request.url);
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? undefined;

    const filters: ReimbursementFilters = {
      submitted_date_start:
        searchParams.get("submitted_date_start") ?? undefined,
      submitted_date_end: searchParams.get("submitted_date_end") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      users: searchParams.get("users") ?? undefined,
      name: query,
      in_invoice: searchParams.get("in_invoice") ?? undefined,
      month: searchParams.get("month") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      site: searchParams.get("site") ?? undefined,
    };
    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined,
      );

    const { data } = await getSitesByLocationId({
      locationId: userProfile?.location_id!,
      supabase,
    });

    const siteIdsArray = data?.map((dat) => dat.id).filter(Boolean) as string[];

    const reimbursementsPromise = getReimbursementsBySiteIds({
      supabase,
      siteIds: siteIdsArray ?? [],
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });

    const userEmailsPromise = getUsersEmail({ supabase, companyId });

    const siteOptions = data?.length ? data?.map((site) => site!.name) : [];

    return defer({
      reimbursementsPromise: reimbursementsPromise as any,
      userEmailsPromise,
      siteIdsArray,
      siteOptions,
      query,
      filters,
      env,
    });
  } catch (error) {
    console.error("Reimbursement Error in loader function:", error);

    return defer({
      reimbursementsPromise: Promise.resolve({ data: [] }),
      userEmailsPromise: Promise.resolve({ data: [] }),
      query: "",
      siteIdsArray: [],
      siteOptions: [],
      filters: null,
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.reimbursements}${url.searchParams.toString()}`,
    args,
  );
}

clientLoader.hydrate = true;

export default function ReimbursementsIndex() {
  const {
    reimbursementsPromise,
    userEmailsPromise,
    query,
    filters,
    siteOptions,
    env,
    siteIdsArray,
  } = useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="py-4 overflow-hidden">
      <div className="w-full flex items-start sm:items-center justify-between pb-4">
        <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-4 mr-4">
          <Suspense fallback={<LoadingSpinner className="ml-14" />}>
            <Await resolve={userEmailsPromise}>
              {(userEmailsData) => (
                <ReimbursementSearchFilter
                  userEmails={
                    userEmailsData?.data?.length
                      ? userEmailsData?.data?.map((user) => user!.email)
                      : []
                  }
                  siteOptions={siteOptions as string[]}
                />
              )}
            </Await>
          </Suspense>
          <FilterList filters={filterList} />
        </div>
        <ReimbursementActions isEmpty={!reimbursementsPromise} env={env} />
      </div>
      <Suspense fallback={<LoadingSpinner className="h-1/3" />}>
        <Await resolve={reimbursementsPromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.reimbursements);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load reimbursements"
                />
              );
            }
            const hasNextPage = Boolean(meta?.count && meta.count > pageSize);
            return (
              <ReimbursementsTable
                data={data ?? []}
                env={env}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                filters={filters}
                query={query}
                columns={columns() as any}
                noFilters={noFilters}
                siteIdsArray={siteIdsArray as string[]}
              />
            );
          }}
        </Await>
      </Suspense>
      <Outlet />
    </section>
  );
}

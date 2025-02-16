import { ReimbursementSearchFilter } from "@/components/reimbursements/reimbursement-search-filter";
import { FilterList } from "@/components/reimbursements/filter-list";
import { ImportReimbursementModal } from "@/components/reimbursements/import-export/import-modal-reimbursements";
import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { LAZY_LOADING_LIMIT, MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  type ReimbursementFilters, getReimbursementsByCompanyId, getProjectNamesByCompanyId, getSiteNamesByProjectName, getUsersEmail,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, type ClientLoaderFunctionArgs, defer, Outlet, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { ReimbursementActions } from "@/components/reimbursements/reimbursement-actions";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import { columns } from "@/components/reimbursements/table/columns";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";

const pageSize = LAZY_LOADING_LIMIT;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.reimbursements}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const url = new URL(request.url);
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? undefined;

    const filters: ReimbursementFilters = {
      submitted_date_start: searchParams.get("submitted_date_start") ?? undefined,
      submitted_date_end: searchParams.get("submitted_date_end") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      is_deductible: searchParams.get("is_deductible") ?? undefined,
      users: searchParams.get("users") ?? undefined,
      name: query,
      project: searchParams.get("project") ?? undefined,
      project_site: searchParams.get("project_site") ?? undefined,
    };

    const hasFilters =
      filters && Object.values(filters).some((value) => value !== null && value !== undefined);

    const reimbursementsPromise = getReimbursementsByCompanyId({
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

    const projectPromise = getProjectNamesByCompanyId({supabase,companyId});

    const userEmailsPromise = getUsersEmail({ supabase, companyId });

    let projectSitePromise = null;
    if (filters.project) 
      projectSitePromise = getSiteNamesByProjectName({supabase,projectName: filters.project});

    return defer({
      reimbursementsPromise: reimbursementsPromise as any,
      projectPromise,
      projectSitePromise,
      userEmailsPromise,
      query,
      filters,
      companyId,
      env,
    });
  } catch (error) {
    console.error("Reimbursement Error in loader function:", error);

    return defer({
      reimbursementsPromise: Promise.resolve({ data: [] }),
      projectPromise: Promise.resolve({ data: [] }),
      projectSitePromise: Promise.resolve({ data: [] }),
      userEmailsPromise: Promise.resolve({ data: [] }),
      query: "",
      filters: null,
      companyId: "",
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return await clientCaching(`${cacheKeyPrefix.reimbursements}${url.searchParams.toString()}`, args);
}

clientLoader.hydrate = true;

export default function ReimbursementsIndex() {
  const {
    reimbursementsPromise,
    projectPromise,
    projectSitePromise,
    userEmailsPromise,
    query,
    filters,
    companyId,
    env,
  } = useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="p-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={projectSitePromise}>
                  {(projectSiteData) => (
                    <Await resolve={userEmailsPromise}>
                      {(userEmailsData) => (
                        <ReimbursementSearchFilter
                          disabled={!projectData?.data?.length && noFilters}
                          projectArray={
                            projectData?.data?.length
                              ? projectData?.data?.map((project) => project!.name) : []
                          }
                          projectSiteArray={
                            projectSiteData?.data?.length
                              ? projectSiteData?.data?.map((site) => site!.name) : []
                          }
                          userEmails={
                            userEmailsData?.data?.length
                              ? userEmailsData?.data?.map((user) => user!.email) : []
                          }
                        />
                      )}
                    </Await>
                  )}
                </Await>
              )}
            </Await>
          </Suspense>
          <FilterList filters={filterList} />
        </div>
        <ReimbursementActions isEmpty={!projectPromise} />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={reimbursementsPromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.reimbursements);
              return <ErrorBoundary error={error} message="Failed to load reimbursements"/>
            }

            const hasNextPage = Boolean(meta?.count > pageSize);

            return (
              <ReimbursementsTable
                data={data ?? []}
                columns={columns({ isEmployeeRoute: false })}
                query={query}
                filters={filters}
                noFilters={noFilters}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                companyId={companyId}
                env={env}
              />
            );
          }}
        </Await>
      </Suspense>
      <ImportReimbursementModal />
      <Outlet />
    </section>
  );
}

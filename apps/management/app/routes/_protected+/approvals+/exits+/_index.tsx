import { ErrorBoundary } from "@/components/error-boundary";
import { ExitActions } from "@/components/exits/exit-actions";
import { ExitsSearchFilter } from "@/components/exits/exit-search-filter";
import { FilterList } from "@/components/exits/filter-list";
import { ImportExitModal } from "@/components/exits/import-export/import-modal-exits";
import { ExitPaymentColumns } from "@/components/exits/table/columns";
import { ExitPaymentTable } from "@/components/exits/table/data-table";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { generateExitFilter } from "@/utils/ai/exit";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  type ExitFilterType,
  getExitsByCompanyId,
  getProjectNamesByCompanyId,
  getSiteNamesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";

const pageSize = 20;

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

    const filters: ExitFilterType = {
      last_working_day_start:
        searchParams.get("last_working_day_start") ?? undefined,
      last_working_day_end:
        searchParams.get("last_working_day_end") ?? undefined,
      final_settlement_date_start:
        searchParams.get("final_settlement_date_start") ?? undefined,
      final_settlement_date_end:
        searchParams.get("final_settlement_date_end") ?? undefined,
      reason: searchParams.get("reason") ?? undefined,
      project: searchParams.get("project") ?? undefined,
      site: searchParams.get("site") ?? undefined,
      in_invoice: searchParams.get("in_invoice") ?? undefined,
      recently_added: searchParams.get("recently_added") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined,
      );

    const exitsPromise = getExitsByCompanyId({
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

    const projectPromise = getProjectNamesByCompanyId({ supabase, companyId });

    const sitePromise = getSiteNamesByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      exitsPromise: exitsPromise as any,
      query,
      filters,
      projectPromise,
      sitePromise,
      env,
      error: null,
    });
  } catch (error) {
    return defer({
      exitsPromise: null,
      query: null,
      filters: null,
      projectPromise: null,
      sitePromise: null,
      env,
      error,
    });
  }
}

// caching
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.exits}${url.searchParams.toString()}`,
    args,
  );
}
clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;

    const { object } = await generateExitFilter({ input: prompt });

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(object)) {
      if (value !== null && value !== undefined && String(value)?.length) {
        searchParams.append(key, value.toString());
      }
    }

    url.search = searchParams.toString();

    return redirect(url.toString());
  } catch (error) {
    console.error("Exits Error in action function:", error);

    const fallbackUrl = new URL(request.url);
    fallbackUrl.search = "";
    return redirect(fallbackUrl.toString());
  }
}

export default function ExitsIndex() {
  const { exitsPromise, query, filters, env, projectPromise, sitePromise } =
    useLoaderData<typeof loader>();

  const noFilters = filters
    ? Object.values(filters).every((value) => !value)
    : true;
  const filterList = { ...filters, name: query };

  return (
    <section className="p-4 overflow-hidden">
      <div className="w-full flex flex-row max-sm:flex-col max-sm:gap-y-3 items-center max-sm:items-start max-md:items-start justify-between pb-4 gap-2">
        <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-2">
          <Suspense fallback={<LoadingSpinner className="ml-10" />}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={sitePromise}>
                  {(siteData) => {
                    if (siteData?.error) {
                      clearCacheEntry(cacheKeyPrefix.exits);
                      return (
                        <ErrorBoundary
                          error={siteData?.error}
                          message="Failed to load Exits"
                        />
                      );
                    }
                    const projectArray =
                      projectData?.data?.map((project) => project.name) ?? [];
                    const siteArray =
                      siteData?.data?.map((site) => site.name) ?? [];

                    return (
                      <>
                        <ExitsSearchFilter
                          projectArray={projectArray}
                          siteArray={siteArray}
                        />
                        <FilterList filterList={filterList} />
                      </>
                    );
                  }}
                </Await>
              )}
            </Await>
          </Suspense>
        </div>
        <div className="flex-shrink-0">
          <ExitActions isEmpty={!exitsPromise} env={env} />
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner className="ml-10" />}>
        <Await
          resolve={exitsPromise}
          errorElement={
            <div>Sorry, Exit data can't be loaded. Try again later!</div>
          }
        >
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.exits);
              return (
                <ErrorBoundary error={error} message="Failed to load Exits" />
              );
            }
            const hasNextPage = Boolean(
              meta?.count && meta.count > LAZY_LOADING_LIMIT,
            );

            return (
              <ExitPaymentTable
                data={data ?? []}
                columns={ExitPaymentColumns}
                count={meta?.count ?? data?.length ?? 0}
                query={query}
                noFilters={noFilters}
                filters={filters}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                env={env}
              />
            );
          }}
        </Await>
      </Suspense>
      <ImportExitModal />
    </section>
  );
}

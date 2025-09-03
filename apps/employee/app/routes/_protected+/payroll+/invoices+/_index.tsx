import { ErrorBoundary } from "@/components/error-boundary";
import { FilterList } from "@/components/invoice/filter-list";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import { InvoiceSearchFilter } from "@/components/invoice/invoice-search-filter";
import { columns } from "@/components/invoice/table/columns";
import { InvoiceTable } from "@/components/invoice/table/data-table";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getInvoicesByLocationId,
  getUserByEmail,
  type InvoiceDataType,
  type InvoiceFilters,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  json,
  Outlet,
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

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? null;

    const filters: InvoiceFilters = {
      date_start: searchParams.get("date_start") ?? null,
      date_end: searchParams.get("date_end") ?? null,
      type: searchParams.get("type") ?? null,
      service_charge: searchParams.get("service_charge") ?? null,
      paid: searchParams.get("paid") ?? null,
      paid_date_start: searchParams.get("paid_date_start") ?? null,
      paid_date_end: searchParams.get("paid_date_end") ?? null,
    };
    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );
    const invoicePromise = await getInvoicesByLocationId({
      supabase,
      locationId: userProfile?.location_id ?? "",
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });

    return defer({
      invoicePromise: invoicePromise as any,
      query,
      env,
      locationId: userProfile?.location_id!,
      filters,
    });
  } catch (error) {
    return json(
      {
        invoicePromise: Promise.resolve({ data: [] }),
        env,
        error,
        locationId: "",
        query: "",
        filters: null,
      },
      { status: 500 }
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.payroll_invoice}${url.searchParams.toString()}`,
    args
  );
}
clientLoader.hydrate = true;

export default function Invoices() {
  const { invoicePromise, filters, query, env, locationId } =
    useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);
  return (
    <section className="p-4 overflow-hidden">
      <div className="w-full flex item-start sm:items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col sm:flex-row  gap-2 mr-4">
          <InvoiceSearchFilter disabled={noFilters} />
          <FilterList filterList={filterList as InvoiceFilters} />
        </div>
        <InvoiceActions isEmpty={!invoicePromise} />
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <Await resolve={invoicePromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.payroll_invoice);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load reimbursements"
                />
              );
            }
            const hasNextPage = Boolean(
              meta?.count && meta.count > LAZY_LOADING_LIMIT
            );

            return (
              <InvoiceTable
                data={data as unknown as InvoiceDataType[]}
                columns={columns}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                filters={filters}
                query={query}
                noFilters={noFilters}
                locationId={locationId as string}
                count={meta?.count ?? data?.length ?? 0}
                env={env}
              />
            );
          }}
        </Await>
        <Outlet />
      </Suspense>
    </section>
  );
}

import { ErrorBoundary } from "@/components/error-boundary";
import { FilterList } from "@/components/invoice/filter-list";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import { InvoiceSearchFilter } from "@/components/invoice/invoice-search-filter";
import { columns } from "@/components/invoice/table/columns";
import { InvoiceTable } from "@/components/invoice/table/data-table";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getInvoicesByCompanyId,
  getLocationsForSelectByCompanyId,
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

const pageSize = LAZY_LOADING_LIMIT;

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  try {
    const url = new URL(request.url);
    const page = 0;
    const searchParams = new URLSearchParams(url.searchParams);
    const query = searchParams.get("name") ?? null;

    const filters: InvoiceFilters = {
      date_start: searchParams.get("date_start") ?? null,
      date_end: searchParams.get("date_end") ?? null,
      company_location: searchParams.get("company_location") ?? null,
      payroll_type: searchParams.get("payroll_type") ?? null,
      invoice_type: searchParams.get("invoice_type") ?? null,
      service_charge: searchParams.get("service_charge") ?? null,
      paid: searchParams.get("paid") ?? null,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const invoicePromise = await getInvoicesByCompanyId({
      supabase,
      companyId,
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
      },
    });
    const locationPromise = await getLocationsForSelectByCompanyId({
      companyId,
      supabase,
    });
    return defer({
      locationPromise: locationPromise as any,
      invoicePromise: invoicePromise as any,
      companyId,
      query,
      filters,
      env,
    });
  } catch (error) {
    return json(
      {
        locationPromise: Promise.resolve({ data: [] }),
        invoicePromise: Promise.resolve({ data: [] }),
        companyId,
        error,
        query: "",
        filters: null,
        env,
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
  const { invoicePromise, env, filters, query, companyId, locationPromise } =
    useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);
  return (
    <section className="p-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-2 mr-4">
          <Suspense fallback={<LoadingSpinner />}>
            <Await resolve={locationPromise}>
              {(locationData) => (
                <>
                  <InvoiceSearchFilter
                    disabled={!locationData?.data?.length && noFilters}
                    locationArray={
                      locationData?.data?.length
                        ? locationData?.data?.map(
                            (location: { name: string } | null) =>
                              location!.name
                          )
                        : []
                    }
                  />
                  <FilterList filterList={filterList as InvoiceFilters} />
                </>
              )}
            </Await>
          </Suspense>
        </div>
        <InvoiceActions />
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
            const hasNextPage = Boolean(meta?.count > data?.length);
            return (
              <InvoiceTable
                data={data as unknown as InvoiceDataType[]}
                columns={columns}
                count={meta?.count ?? 0}
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
        <Outlet />
      </Suspense>
    </section>
  );
}

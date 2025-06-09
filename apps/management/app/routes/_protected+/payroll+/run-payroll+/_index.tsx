import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@canny_ecosystem/ui/command";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PayrollCard } from "@/components/payroll/payroll-card";
import {
  getPendingOrSubmittedPayrollsByCompanyId,
  type PayrollFilters,
} from "@canny_ecosystem/supabase/queries";
import { ErrorBoundary } from "@/components/error-boundary";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { formatDate } from "@canny_ecosystem/utils";
import { ImportPayrollDialog } from "@/components/payroll/import-payroll-dialog";
import { ImportPayrollModal } from "@/components/payroll/import-export/import-modal-payroll";
import { ImportSalaryPayrollModal } from "@/components/payroll/import-export/import-modal-salary-payroll";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import { PayrollSearchFilter } from "@/components/payroll/payroll-search-filter";
import { FilterList } from "@/components/payroll/filter-list";
import type { PayrollDatabaseRow } from "@canny_ecosystem/supabase/types";

const pageSize = LAZY_LOADING_LIMIT;

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const url = new URL(request.url);
    const page = 0;
    const searchParams = new URLSearchParams(url.searchParams);
    const query = searchParams.get("name") ?? null;

    const filters: PayrollFilters = {
      date_start: searchParams.get("date_start") ?? null,
      date_end: searchParams.get("date_end") ?? null,
      payroll_type: searchParams.get("payroll_type") ?? null,
      status: searchParams.get("status") ?? null,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const payrollsPromise = getPendingOrSubmittedPayrollsByCompanyId({
      supabase,
      companyId: companyId ?? "",
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
      },
    });

    return defer({ payrollsPromise, query, filters });
  } catch (error) {
    console.error("Run Payroll Error", error);
    return defer({
      payrollsPromise: Promise.resolve({ data: [], error: null }),
      query: "",
      filters: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.run_payroll, args);
}

clientLoader.hydrate = true;

export default function RunPayrollIndex() {
  const { payrollsPromise, filters, query } = useLoaderData<typeof loader>();
  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="py-4 px-4">
      <div className="w-full flex flex-col items-end justify-between">
        <Suspense fallback={<LoadingSpinner className="my-20" />}>
          <Await resolve={payrollsPromise}>
            {({ data, error }) => {
              clearCacheEntry(cacheKeyPrefix.run_payroll);
              if (error)
                return (
                  <ErrorBoundary
                    error={error}
                    message="Error in fetching payroll"
                  />
                );

              return (
                <div className="w-full flex items-center justify-between">
                  <div className="w-1/2 flex gap-4">
                    <PayrollSearchFilter
                      disabled={!data?.length && noFilters}
                      from={"run-payroll"}
                    />
                    <FilterList filterList={filterList as PayrollFilters} />
                  </div>
                  <ImportPayrollDialog />
                </div>
              );
            }}
          </Await>
        </Suspense>
        <Suspense fallback={<LoadingSpinner className="my-20" />}>
          <Await resolve={payrollsPromise}>
            {({ data, error }) => {
              clearCacheEntry(cacheKeyPrefix.run_payroll);
              if (error)
                return (
                  <ErrorBoundary
                    error={error}
                    message="Error in fetching payroll"
                  />
                );

              const { isDocument } = useIsDocument();

              return (
                <Command className="overflow-visible">
                  <CommandEmpty
                    className={cn(
                      "w-full py-40 capitalize text-lg tracking-wide text-center",
                      !isDocument && "hidden"
                    )}
                  >
                    No payrolls found
                  </CommandEmpty>
                  <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
                    <CommandGroup className="p-0 overflow-visible">
                      <div className="w-full grid gap-8 grid-cols-1">
                        {data?.map((payroll: any) => {
                          if (!payroll) return null;
                          return (
                            <CommandItem
                              key={payroll.id}
                              value={
                                payroll.id +
                                payroll?.commission +
                                payroll?.payroll_type +
                                formatDate(payroll?.run_date) +
                                payroll?.status +
                                payroll?.total_employees +
                                payroll?.total_net_amount +
                                formatDate(payroll?.created_at)
                              }
                              className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
                            >
                              <PayrollCard
                                data={
                                  payroll as unknown as Omit<
                                    PayrollDatabaseRow,
                                    "updated_at"
                                  >
                                }
                                key={payroll.id}
                              />
                            </CommandItem>
                          );
                        })}
                      </div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              );
            }}
          </Await>
        </Suspense>
      </div>

      <ImportPayrollModal />
      <ImportSalaryPayrollModal />
      <Outlet />
    </section>
  );
}

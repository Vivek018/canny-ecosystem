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
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Outlet,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
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
import { ImportSalaryPayrollModal } from "@/components/payroll/import-export/import-salary-modal-payroll";
import { PayrollSearchFilter } from "@/components/payroll/payroll-search-filter";
import { FilterList } from "@/components/payroll/filter-list";
import type { PayrollDatabaseRow } from "@canny_ecosystem/supabase/types";
import { useInView } from "react-intersection-observer";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { generatePayrollFilter } from "@/utils/ai/payroll";

const pageSize = 15;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const query = searchParams.get("name") ?? null;

    const filters: PayrollFilters = {
      date_start: searchParams.get("date_start") ?? null,
      date_end: searchParams.get("date_end") ?? null,
      status: searchParams.get("status") ?? null,
      month: searchParams.get("month") ?? null,
      year: searchParams.get("year") ?? null,
    };

    const payrollsPromise = getPendingOrSubmittedPayrollsByCompanyId({
      supabase,
      companyId: companyId ?? "",
      params: {
        from: 0,
        to: pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
      },
    });

    return defer({ payrollsPromise, query, filters, env, companyId });
  } catch (error) {
    console.error("Run Payroll Error", error);
    return defer({
      payrollsPromise: Promise.resolve({ data: [], error: null }),
      query: "",
      filters: null,
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
      },
      companyId: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.run_payroll, args);
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;

    const { object } = await generatePayrollFilter({ input: prompt });

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(object)) {
      if (value !== null && value !== undefined && String(value)?.length) {
        searchParams.append(key, value.toString());
      }
    }

    url.search = searchParams.toString();

    return redirect(url.toString());
  } catch (error) {
    console.error("Payroll Error in action function:", error);

    const fallbackUrl = new URL(request.url);
    fallbackUrl.search = "";
    return redirect(fallbackUrl.toString());
  }
}

export default function RunPayrollIndex() {
  const { payrollsPromise, filters, query, companyId, env } =
    useLoaderData<typeof loader>();
  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);
  const { ref, inView } = useInView();
  const { supabase } = useSupabase({ env });
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
                      from="run-payroll"
                    />
                    <FilterList filterList={filterList as PayrollFilters} />
                  </div>
                  <div className="gap-4 hidden md:flex">
                    <div className="flex gap-2">
                      <ImportPayrollDialog />
                    </div>
                  </div>
                </div>
              );
            }}
          </Await>
        </Suspense>
        <Suspense fallback={<LoadingSpinner className="my-20" />}>
          <Await resolve={payrollsPromise}>
            {(result) => {
              clearCacheEntry(cacheKeyPrefix.run_payroll);

              const innitial = result.data;
              const meta = "meta" in result ? result.meta : undefined;
              const error = result.error;
              if (error)
                return (
                  <ErrorBoundary
                    error={error}
                    message="Error in fetching payroll"
                  />
                );

              const { isDocument } = useIsDocument();
              const [hasNextPage, setHasNextPage] = useState(
                Boolean(
                  meta?.count && innitial?.length
                    ? meta.count > innitial.length
                    : false,
                ),
              );

              const [data, setData] = useState(innitial);
              const [from, setFrom] = useState(pageSize);
              useEffect(() => {
                setData(innitial);
                setFrom(pageSize);
                setHasNextPage(
                  Boolean(
                    meta?.count && innitial?.length
                      ? meta.count > innitial.length
                      : false,
                  ),
                );
              }, [innitial]);

              const loadMorePayrolls = async () => {
                const formattedFrom = from;
                const to = formattedFrom + pageSize - 1;

                try {
                  if (companyId) {
                    const { data: moreData } =
                      await getPendingOrSubmittedPayrollsByCompanyId({
                        supabase,
                        companyId,
                        params: {
                          from: formattedFrom,
                          to,
                          filters,
                          searchQuery: query ?? undefined,
                        },
                      });

                    if (moreData?.length) {
                      setData((prevData: any) => [...prevData, ...moreData]);
                      setFrom(to + 1);
                      setHasNextPage(moreData.length === pageSize);
                      length;
                    } else {
                      setHasNextPage(false);
                    }
                  }
                } catch (error) {
                  console.error("Error loading more payrolls", error);
                  setHasNextPage(false);
                }
              };

              useEffect(() => {
                if (inView) {
                  loadMorePayrolls();
                }
              }, [inView]);

              return (
                <>
                  <Command className="overflow-visible">
                    <CommandEmpty
                      className={cn(
                        "w-full py-40 capitalize text-lg tracking-wide text-center",
                        !isDocument && "hidden",
                      )}
                    >
                      No payrolls found.
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
                                    payroll as unknown as PayrollDatabaseRow
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
                  {hasNextPage && innitial?.length && (
                    <div
                      className="flex items-center justify-center mt-6 mx-auto"
                      ref={ref}
                    >
                      <div className="flex items-center space-x-2 px-6 py-5">
                        <Spinner />
                        <span className="text-sm text-[#606060]">
                          Loading more...
                        </span>
                      </div>
                    </div>
                  )}
                </>
              );
            }}
          </Await>
        </Suspense>
      </div>

      <ImportSalaryPayrollModal />
      <Outlet />
    </section>
  );
}

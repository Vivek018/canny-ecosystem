import { ErrorBoundary } from "@/components/error-boundary";
import { clearExactCacheEntry } from "@/utils/cache";
import { LAZY_LOADING_LIMIT } from "@canny_ecosystem/supabase/constant";
import { Await, Outlet } from "@remix-run/react";
import { Suspense } from "react";
import { EmployeesSearchFilter } from "../employee-search-filter";
import { FilterList } from "../filter-list";
import { ColumnVisibility } from "../column-visibility";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { cacheKeyPrefix } from "@/constant";
import type { EmployeeFilters } from "@canny_ecosystem/supabase/queries";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";

export default function InchargeEmployees({
  employeesPromise,
  env,
  pageSize,
  query,
  siteIdsArray,
  filters,
  siteOptions,
}: {
  filters?: EmployeeFilters | null;
  employeesPromise: any;
  env: SupabaseEnv;
  pageSize: number;
  siteIdsArray: string[];
  query: string | undefined;
  siteOptions: string[];
}) {
  const filterList = { ...filters, name: query };

  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <Suspense fallback={<div className="h-1/3" />}>
      <Await resolve={employeesPromise}>
        {({ data, meta, error }) => {
          if (error) {
            clearExactCacheEntry(cacheKeyPrefix.employees);
            return (
              <ErrorBoundary error={error} message="Failed to load employees" />
            );
          }

          const hasNextPage = Boolean(
            meta?.count && meta.count > LAZY_LOADING_LIMIT
          );

          return (
            <section className="h-full">
              <div className="w-full flex items-start sm:items-center justify-between pb-4 gap-3">
                <div className="w-full flex flex-col sm:flex-row items-center  gap-4">
                  <EmployeesSearchFilter siteOptions={siteOptions} />
                  <FilterList filterList={filterList} />
                </div>
                <div className="space-x-2 flex flex-col items-start">
                  <ColumnVisibility />
                </div>
              </div>

              <DataTable
                data={data ?? []}
                columns={columns() as any}
                count={meta?.count ?? data?.length ?? 0}
                env={env}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                siteIdsArray={siteIdsArray as string[]}
                filters={filters}
                noFilters={noFilters}
                query={query}
              />
            </section>
          );
        }}
      </Await>
      <Outlet />
    </Suspense>
  );
}

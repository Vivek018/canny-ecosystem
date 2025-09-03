import { ErrorBoundary } from "@/components/error-boundary";
import { clearExactCacheEntry } from "@/utils/cache";
import { Await, Outlet } from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import { ColumnVisibility } from "../column-visibility";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { cacheKeyPrefix } from "@/constant";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { searchInObject } from "@canny_ecosystem/utils";

export default function SupervisorEmployees({
  employeesPromise,
}: {
  employeesPromise: any;
}) {
  return (
    <Suspense fallback={<div className="h-1/3" />}>
      <Await resolve={employeesPromise}>
        {({ data, error }) => {
          if (error) {
            clearExactCacheEntry(cacheKeyPrefix.employees);
            return (
              <ErrorBoundary error={error} message="Failed to load employees" />
            );
          }

          const [tableData, setTableData] = useState(data);
          const [searchString, setSearchString] = useState("");

          useEffect(() => {
            const filteredData = data?.filter((item: any) =>
              searchInObject(item, searchString)
            );
            setTableData(filteredData);
          }, [searchString, data]);
          return (
            <section className="h-full">
              <div className="w-full flex items-start sm:items-center justify-between pb-4 gap-3">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Icon
                      name="magnifying-glass"
                      size="sm"
                      className="text-gray-400"
                    />
                  </div>
                  <Input
                    placeholder="Search Users"
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                    className="pl-8 h-10 w-full focus-visible:ring-0 shadow-none"
                  />
                </div>
                <div className="space-x-2 flex flex-col items-start">
                  <ColumnVisibility />
                </div>
              </div>

              <DataTable data={tableData ?? []} columns={columns() as any} />
            </section>
          );
        }}
      </Await>
      <Outlet />
    </Suspense>
  );
}

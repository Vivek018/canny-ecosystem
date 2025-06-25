import { FilterList } from "@/components/employees/salary/filter-list";
import { SalaryFilter } from "@/components/employees/salary/salary-filter";
import SalaryInfoCard from "@/components/employees/salary/salary-info-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import {
  type DashboardFilters,
  getSalaryEntriesByEmployeeId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  defer,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { useState } from "react";

interface GroupedPayrollFields {
  [fieldName: string]: {
    amount: number;
    type: string;
  };
}
export interface GroupedPayrollEntry {
  payroll_id: string;
  employee_id: string;
  month: number;
  year: number;
  present_days: number;
  overtime_hours: number;
  fields: GroupedPayrollFields;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.searchParams);

  const employeeId = params.employeeId ?? "";
  const filters: DashboardFilters = {
    year: searchParams.get("year") ?? undefined,
  };

  try {
    const { data: salaryEntries, error } = await getSalaryEntriesByEmployeeId({
      supabase,
      employeeId,
      filters,
    });
    if (error) {
      console.error(error);
    }
    return defer({
      salaryEntries,
      filters,
      error,
    });
  } catch (error) {
    return defer({
      salaryEntries: null,
      filters,
      error,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);

  return clientCaching(
    `${cacheKeyPrefix.employee_salary}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export default function Salary() {
  const { error, salaryEntries, filters } = useLoaderData<typeof loader>();

  if (error) {
    clearCacheEntry(`${cacheKeyPrefix.employee_salary}`);
    return (
      <ErrorBoundary error={error} message="Failed to load employee details" />
    );
  }
  function groupPayrollData(data: unknown) {
    interface SalaryEntry {
      payroll_id: string;
      employee_id: string;
      month: number;
      year: number;
      present_days: number;
      overtime_hours: number;
      field_name: string;
      amount: number;
      type: string;
    }

    const [grouped] = useState<{ [id: string]: GroupedPayrollEntry }>({});

    for (const entry of data as SalaryEntry[]) {
      const id = entry.payroll_id;

      if (!grouped[id]) {
        grouped[id] = {
          payroll_id: id,
          employee_id: entry.employee_id,
          month: entry.month,
          year: entry.year,
          present_days: entry.present_days,
          overtime_hours: entry.overtime_hours,
          fields: {},
        };
      }

      grouped[id].fields[entry.field_name] = {
        amount: entry.amount,
        type: entry.type,
      };
    }

    return Object.values(grouped);
  }

  return (
    <section className="py-4 flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="flex justify-between gap-3">
          <FilterList filters={filters as unknown as DashboardFilters} />
          <SalaryFilter />
        </div>
      </div>
      {(salaryEntries?.length ?? 0) > 0 ? (
        <div className="flex-1 w-full grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 justify-start auto-rows-min">
          {groupPayrollData(salaryEntries ?? [])
            .reverse()
            .map((salary, index) => (
              <SalaryInfoCard
                key={index.toString()}
                salaryData={salary as unknown as GroupedPayrollEntry}
              />
            ))}
        </div>
      ) : (
        <div className="h-full w-full flex justify-center items-center text-xl">
          No Salary Data Found
        </div>
      )}
      <Outlet />
    </section>
  );
}

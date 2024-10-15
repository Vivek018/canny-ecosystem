import { EmployeesActions } from "@/components/employees/employee-actions";
import { columns } from "@/components/employees/table/columns";
import { DataTable } from "@/components/employees/table/date-table";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getEmployeesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, useLoaderData } from "@remix-run/react";

const pageSize = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const page = 0;

  const searchParam = new URLSearchParams(url.searchParams);
  const sortParam = searchParam.get("sort");

  const { data, meta, error } = await getEmployeesByCompanyId({
    supabase,
    companyId,
    params: {
      from: 0,
      to: pageSize - 1,
      sort: sortParam?.split(":") as [string, "asc" | "desc"],
    },
  });

  const hasNextPage = Boolean(
    meta?.count && meta.count / (page + 1) > pageSize,
  );

  if (error) {
    throw error;
  }

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return json({
    data,
    count: meta?.count,
    hasNextPage,
    companyId,
    env,
  });
}

export default function Employees() {
  const { data, count, hasNextPage, companyId, env } = useLoaderData<typeof loader>();

  return (
    <section className="py-[22px]">
      <div className="flex items-center justify-between pb-4">
        <p>Search</p>
        <EmployeesActions isEmpty={!data?.length} />
      </div>
      <DataTable
        data={data ?? []}
        columns={columns}
        count={count ?? data?.length ?? 0}
        hasNextPage={hasNextPage}
        pageSize={pageSize}
        companyId={companyId}
        env={env}
      />
      <Outlet />
    </section>
  );
}

import { EmployeesActions } from "@/components/employees/employee-actions";
import { columns } from "@/components/employees/table/columns";
import { DataTable } from "@/components/employees/table/date-table";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getEmployeesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const sortParam = url.searchParams.get("sort");
  const { data, error } = await getEmployeesByCompanyId({
    supabase,
    companyId,
    params: {
      from: 0,
      sort: sortParam?.split(":") as [string, "asc" | "desc"],
    },
  });

  if (error) {
    throw error;
  }

  return json({ data });
}

export default function Employees() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <section className="py-[22px]">
      <div className="flex items-center justify-between pb-4">
        <p>Search</p>
        <EmployeesActions isEmpty={!data?.length} />
      </div>
      <DataTable data={data ?? []} columns={columns} />
      <Outlet />
    </section>
  );
}

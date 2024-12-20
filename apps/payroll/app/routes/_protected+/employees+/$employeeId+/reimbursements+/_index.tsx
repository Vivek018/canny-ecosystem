import { FilterList } from "@/components/reimbursements/filter-list";
import { ReimbursementSearchFilter } from "@/components/reimbursements/reimbursement-search-filter";
import { reimbursementsColumns } from "@/components/reimbursements/table/columns";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import { LAZY_LOADING_LIMIT } from "@canny_ecosystem/supabase/constant";
import { getReimbursementsByEmployeeId, getUsersEmail } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";

import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useLoaderData } from "@remix-run/react";


export const UPDATE_REIMBURSEMENTS_TAG = "Update Reimbursements";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const employeeId = params.employeeId;
  const { supabase } = getSupabaseWithHeaders({ request });
  let reimbursementData = null;
  const searchParams = new URLSearchParams(url.searchParams);

  const query = searchParams.get("name") ?? undefined;

  const filters = {
    submitted_date_start: searchParams.get("submitted_date_start") ?? undefined,
    submitted_date_end: searchParams.get("submitted_date_end") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    is_deductible: searchParams.get("is_deductible") ?? undefined,
    user_email: searchParams.get("user_email") ?? undefined,
  };

  const { data, error } = await getUsersEmail({ supabase });
  if (error) {
    throw error;
  }

  if (employeeId) {
    const { data, error } = await getReimbursementsByEmployeeId({
      supabase,
      employeeId: employeeId,
      from: 0,
      to: LAZY_LOADING_LIMIT - 1,
      filters,
      searchQuery: query ?? undefined,
    });

    if (error) {
      throw error;
    }

    reimbursementData = data;
  }
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  return json({
    data: reimbursementData as any,
    env,
    employeeId,
    filters,
    query,
    userEmails: data?.map((user) => user.email) ?? [],
  });
}

export default function ReimbursementsIndex() {
  const { data, env, employeeId, filters, userEmails } =
    useLoaderData<typeof loader>();

  

  const noFilters = Object.values(filters).every((value) => !value);
  console.log("data:", data);
  
  return (
    <section className="m-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full flex justify-between items-center ">
          <div className="flex gap-3">
            <ReimbursementSearchFilter disabled={!data?.length && noFilters} userEmails={userEmails} />
            <FilterList filters={filters} />
          </div>

          <Link
            to={"add-reimbursement"}
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              "flex items-center gap-1"
            )}
          >
            <span>Add</span>
            <span className="hidden md:flex justify-end">Claim</span>
          </Link>
        </div>
      </div>
      <ReimbursementsTable
        data={data ?? []}
        columns={reimbursementsColumns({ isEmployeeRoute: true })}
        hasNextPage={true}
        pageSize={LAZY_LOADING_LIMIT}
        env={env}
        employeeId={employeeId}
      />
    </section>
  );
}

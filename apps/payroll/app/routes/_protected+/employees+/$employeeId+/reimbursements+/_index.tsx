import { FilterList } from "@/components/reimbursements/filter-list";
import { ReimbursementSearchFilter } from "@/components/reimbursements/reimbursement-search-filter";
import { reimbursementsColumns } from "@/components/reimbursements/table/columns";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getReimbursementsByEmployeeId,
  getUsersEmail,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";

import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, redirect, useLoaderData } from "@remix-run/react";

export const UPDATE_REIMBURSEMENTS_TAG = "Update Reimbursements";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const employeeId = params.employeeId;
  const { supabase } = getSupabaseWithHeaders({ request });
  let reimbursementData = null;
  const searchParams = new URLSearchParams(url.searchParams);
  const sortParam = searchParams.get("sort");
  const query = searchParams.get("name") ?? undefined;
  const page = 0;

  const filters = {
    submitted_date_start: searchParams.get("submitted_date_start") ?? undefined,
    submitted_date_end: searchParams.get("submitted_date_end") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    is_deductible: searchParams.get("is_deductible") ?? undefined,
    users: searchParams.get("users") ?? undefined,
    name: query,
  };

  const { data, error } = await getUsersEmail({ supabase });
  if (error) {
    throw error;
  }
  const hasFilters =
    filters &&
    Object.values(filters).some(
      (value) => value !== null && value !== undefined
    );

  let theMeta=null
  if (employeeId) {
    const { data, error, meta } = await getReimbursementsByEmployeeId({
      supabase,
      employeeId: employeeId,
      params: {
        from: 0,
        to: hasFilters
          ? MAX_QUERY_LIMIT
          : page > 0
          ? LAZY_LOADING_LIMIT
          : LAZY_LOADING_LIMIT - 1,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });

    if (error) {
      throw error;
    }

    reimbursementData = data;
    theMeta=meta
  }
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const hasNextPage = Boolean(
    theMeta?.count && theMeta.count / (page + 1) > LAZY_LOADING_LIMIT
  );

  return json({
    data: reimbursementData as any,
    env,
    employeeId,
    hasNextPage,
    filters,
    query,
    userEmails: data?.map((user) => user.email) ?? [],
  });
}


export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();

  const prompt = formData.get("prompt") as string | null;

  // Prepare search parameters
  const searchParams = new URLSearchParams();
  if (prompt && prompt.trim().length > 0) {
    searchParams.append("name", prompt.trim());
  }

  // Update the URL with the search parameters
  url.search = searchParams.toString();

  return redirect(url.toString());
}


export default function ReimbursementsIndex() {
  const { data, env, employeeId, filters, userEmails,hasNextPage } =
    useLoaderData<typeof loader>();

  const noFilters = Object.values(filters).every((value) => !value);

  return (
    <section className="m-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full flex justify-between items-center ">
          <div className="flex gap-3">
            <ReimbursementSearchFilter
              disabled={!data?.length && noFilters}
              userEmails={userEmails}
              employeeId={employeeId}
            />
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
        hasNextPage={hasNextPage}
        pageSize={LAZY_LOADING_LIMIT}
        env={env}
        employeeId={employeeId}
      />
    </section>
  );
}

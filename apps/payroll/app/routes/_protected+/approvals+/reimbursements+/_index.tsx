import { FilterList } from "@/components/reimbursements/filter-list";
import { ReimbursementSearchFilter } from "@/components/reimbursements/reimbursement-search-filter";
import { reimbursementsColumns } from "@/components/reimbursements/table/columns";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getReimbursementsByCompanyId,
  getUsersEmail,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const searchParams = new URLSearchParams(url.searchParams);
  const query = searchParams.get("name") ?? undefined;
  const sortParam = searchParams.get("sort");
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
      (value) => value !== null && value !== undefined,
    );

  const {
    data: reimbursementData,
    error: reimbursementError,
    meta,
  } = await getReimbursementsByCompanyId({
    supabase,
    companyId,
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
  if (reimbursementError || !reimbursementData) {
    throw reimbursementError;
  }
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const hasNextPage = Boolean(
    meta?.count && meta.count / (page + 1) > LAZY_LOADING_LIMIT,
  );

  return json({
    reimbursementData,
    env,
    companyId,
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

export default function Reimbursements() {
  const {
    reimbursementData,
    env,
    companyId,
    query,
    filters,
    userEmails,
    hasNextPage,
  } = useLoaderData<typeof loader>();

  const noFilters = Object.values(filters).every((value) => !value);

  return (
    <section className="m-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full  flex justify-between items-center gap-3">
          <ReimbursementSearchFilter
            disabled={!reimbursementData?.length && noFilters}
            userEmails={userEmails}
          />
          <FilterList filters={filters} />
        </div>
      </div>
      <ReimbursementsTable
        data={reimbursementData as any}
        columns={reimbursementsColumns({})}
        filters={filters}
        hasNextPage={hasNextPage}
        noFilters={noFilters}
        pageSize={LAZY_LOADING_LIMIT}
        env={env}
        query={query}
        companyId={companyId}
      />
    </section>
  );
}

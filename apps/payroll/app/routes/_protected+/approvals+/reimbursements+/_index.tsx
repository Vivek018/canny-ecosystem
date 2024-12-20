import { FilterList } from "@/components/reimbursements/filter-list";
import { ReimbursementSearchFilter } from "@/components/reimbursements/reimbursement-search-filter";
import { reimbursementsColumns } from "@/components/reimbursements/table/columns";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { LAZY_LOADING_LIMIT } from "@canny_ecosystem/supabase/constant";
import { getReimbursementsByCompanyId, getUsersEmail } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";


export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const searchParams = new URLSearchParams(url.searchParams);
  const query = searchParams.get("name") ?? undefined;

  const filters = {
    submitted_date_start: searchParams.get("submitted_date_start") ?? undefined,
    submitted_date_end: searchParams.get("submitted_date_end") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    is_deductible: searchParams.get("is_deductible") ?? undefined,
    user_email:searchParams.get("user_email") ?? undefined,
  };
const {data, error}=await getUsersEmail({supabase})
if(error){
  throw error
}

  const { data: reimbursementData, error: reimbursementError } =
    await getReimbursementsByCompanyId({
      supabase,
      companyId,
      from: 0,
      to: LAZY_LOADING_LIMIT - 1,
      filters,
      searchQuery: query ?? undefined,
    });
  if (reimbursementError || !reimbursementData) {
    throw reimbursementError;
  }
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return json({ reimbursementData, env, companyId, filters,query,userEmails: data?.map((user) => user.email) ?? [],});
}

export default function Reimbursements() {
  const { reimbursementData, env, companyId, filters ,userEmails} =
    useLoaderData<typeof loader>();
   
  
  
  const noFilters = Object.values(filters).every((value) => !value);
console.log(userEmails)

  return (
    <section className="m-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full  flex justify-between items-center gap-3">
          
          <ReimbursementSearchFilter disabled={!reimbursementData?.length && noFilters} 
          userEmails={userEmails} />
          <FilterList filters={filters} />
        </div>
      </div>
      <ReimbursementsTable
        data={reimbursementData as any}
        columns={reimbursementsColumns({})}
        hasNextPage={true}
        pageSize={LAZY_LOADING_LIMIT}
        env={env}
        companyId={companyId}
      />
    </section>
  );
}

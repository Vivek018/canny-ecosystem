import { ColumnVisibility } from "@/components/reimbursements/column-visibility";
import { FilterList } from "@/components/reimbursements/filter-list";
import { ImportReimbursementMenu } from "@/components/reimbursements/import-menu";
import { ImportReimbursementModal } from "@/components/reimbursements/import-export/import-modal-reimbursements";
import { ReimbursementSearchFilter } from "@/components/reimbursements/reimbursement-search-filter";
import { reimbursementsColumns } from "@/components/reimbursements/table/columns";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import { useReimbursementStore } from "@/store/reimbursements";

import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getProjectNamesByCompanyId,
  getReimbursementsByCompanyId,
  getSiteNamesByProjectName,
  getUsersEmail,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  json,
  redirect,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

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
    project: searchParams.get("project") ?? undefined,
    project_site: searchParams.get("project_site") ?? undefined,
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
    meta?.count && meta.count / (page + 1) > LAZY_LOADING_LIMIT
  );
  const { data: projectData } = await getProjectNamesByCompanyId({
    supabase,
    companyId,
  });

  let projectSiteData = null;
  if (filters.project) {
    const { data } = await getSiteNamesByProjectName({
      supabase,
      projectName: filters.project,
    });
    projectSiteData = data;
  }
  return json({
    reimbursementData,
    env,
    companyId,
    hasNextPage,
    filters,
    query,
    projectArray: projectData?.map((project) => project.name) ?? [],
    projectSiteArray: projectSiteData?.map((site) => site.name) ?? [],
    userEmails: data?.map((user) => user.email) ?? [],
  });
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);

  return await clientCaching(
    `${cacheKeyPrefix.reimbursements}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();

  const prompt = formData.get("prompt") as string | null;

  const searchParams = new URLSearchParams();
  if (prompt && prompt.trim().length > 0) {
    searchParams.append("name", prompt.trim());
  }

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
    projectArray,
    projectSiteArray,
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { selectedRows } = useReimbursementStore();

  const noFilters = Object.values(filters).every((value) => !value);

  return (
    <section className='m-4'>
      <div className='w-full flex items-center justify-between pb-4'>
        <div className='flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4'>
          <ReimbursementSearchFilter
            disabled={!reimbursementData?.length && noFilters}
            userEmails={userEmails}
            projectArray={projectArray}
            projectSiteArray={projectSiteArray}
          />
          <FilterList filters={filters} />
        </div>
        <div className='space-x-2 hidden md:flex'>
          {!selectedRows.length ? (
            <>
              <ColumnVisibility disabled={!reimbursementData?.length} />
              <ImportReimbursementMenu />
            </>
          ) : (
            <Button
              variant='outline'
              size='icon'
              className='h-10 w-10'
              disabled={!selectedRows.length}
              onClick={() => navigate("/approvals/reimbursements/analytics")}
            >
              <Icon name='chart' className='h-[18px] w-[18px]' />
            </Button>
          )}
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
      <ImportReimbursementModal />
    </section>
  );
}

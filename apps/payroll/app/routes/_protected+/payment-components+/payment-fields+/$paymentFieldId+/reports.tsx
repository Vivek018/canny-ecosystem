import { FilterList } from "@/components/payment-field/reports/filter-list";
import { PaymentFieldsReportSearchFilter } from "@/components/payment-field/reports/report-search-filter";
import { columns } from "@/components/payment-field/reports/table/columns";
import { DataTable } from "@/components/payment-field/reports/table/data-table";
import { ColumnVisibility } from "@/components/reports/column-visibility";
import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  type EmployeeReportDataType,
  getEmployeesReportByCompanyId,
  getPaymentFieldById,
  getProjectNamesByCompanyId,
  getSiteNamesByProjectName,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Outlet,
  redirect,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { Suspense } from "react";

const pageSize = 20;

export type PaymentFieldReportFilters = {
  start_month: string | undefined;
  end_month: string | undefined;
  start_year: string | undefined;
  end_year: string | undefined;
  project: string | undefined;
  project_site: string | undefined;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  try {
    const url = new URL(request.url);
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;
    const paymentFieldId = params.paymentFieldId;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? undefined;

    const filters: PaymentFieldReportFilters = {
      start_month: searchParams.get("start_month") ?? undefined,
      end_month: searchParams.get("end_month") ?? undefined,
      start_year: searchParams.get("start_year") ?? undefined,
      end_year: searchParams.get("end_year") ?? undefined,
      project: searchParams.get("project") ?? undefined,
      project_site: searchParams.get("project_site") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const reportPromise = getEmployeesReportByCompanyId({
      supabase,
      companyId,
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });

    const paymentFieldPromise = paymentFieldId
      ? getPaymentFieldById({
          supabase,
          id: paymentFieldId,
        })
      : Promise.resolve({ data: null, error: null });

    const projectPromise = getProjectNamesByCompanyId({
      supabase,
      companyId,
    });

    const projectSitePromise = filters.project
      ? getSiteNamesByProjectName({
          supabase,
          projectName: filters.project,
        })
      : Promise.resolve({ data: null });

    return defer({
      reportPromise: reportPromise as any,
      paymentFieldPromise,
      projectPromise,
      projectSitePromise,
      query,
      filters,
      companyId,
      env,
    });
  } catch (error) {
    console.error("Report Error in loader function:", error);
    return defer({
      reportPromise: Promise.resolve({ data: [], meta: { count: 0 } }),
      paymentFieldPromise: Promise.resolve({ data: null, error: null }),
      projectPromise: Promise.resolve({ data: [] }),
      projectSitePromise: Promise.resolve({ data: [] }),
      query: "",
      filters: null,
      companyId: "",
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return await clientCaching(
    `${cacheKeyPrefix.payment_field_report}${
      args.params.paymentFieldId
    }${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string | null;

  try {
    const searchParams = new URLSearchParams();
    if (prompt && prompt.trim().length > 0) {
      searchParams.append("name", prompt.trim());
    }
    url.search = searchParams.toString();
    return redirect(url.toString());
  } catch (error) {
    console.error("Report Error in action function:", error);
    const fallbackUrl = new URL(request.url);
    fallbackUrl.search = "";
    return redirect(fallbackUrl.toString());
  }
}

export default function PaymentFieldsReport() {
  const {
    reportPromise,
    paymentFieldPromise,
    projectPromise,
    projectSitePromise,
    query,
    filters,
    companyId,
    env,
  } = useLoaderData<typeof loader>();

  const { paymentFieldId } = useParams();
  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className='py-6 px-4'>
      <div className='w-full flex items-center justify-between pb-4'>
        <div className='flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4'>
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={projectSitePromise}>
                  {(projectSiteData) => (
                    <PaymentFieldsReportSearchFilter
                      disabled={!projectData?.data?.length && noFilters}
                      projectArray={
                        projectData?.data?.map((project) => project!.name) ?? []
                      }
                      projectSiteArray={
                        projectSiteData?.data?.map((site) => site!.name) ?? []
                      }
                    />
                  )}
                </Await>
              )}
            </Await>
          </Suspense>
          <FilterList filterList={filterList} />
        </div>
        <ColumnVisibility disabled={!projectPromise} />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={Promise.all([reportPromise, paymentFieldPromise])}>
          {([{ data, meta, error }, paymentField]) => {
            if (error || paymentField.error || !data?.length) {
              clearCacheEntry(
                `${cacheKeyPrefix.payment_field_report}${paymentFieldId}`
              );
              throw error || paymentField.error;
            }

            const hasNextPage = Boolean(meta?.count > pageSize);

            const paymentFieldsReportData = data?.map(
              (employee: EmployeeReportDataType) => ({
                ...employee,
                field_name: paymentField.data?.name,
                amount: 4324,
                start_date: new Date(),
                end_date: new Date(),
              })
            );

            return (
              <DataTable
                data={paymentFieldsReportData ?? []}
                columns={columns()}
                count={meta?.count ?? data?.length ?? 0}
                query={query}
                filters={filters}
                noFilters={noFilters}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                companyId={companyId}
                env={env}
              />
            );
          }}
        </Await>
      </Suspense>
      <Outlet />
    </section>
  );
}

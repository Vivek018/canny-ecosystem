import { EmployeesSearchFilter } from "@/components/employees/employee-search-filter";
import { FilterList } from "@/components/employees/filter-list";
import { ImportEmployeeAddressModal } from "@/components/employees/import-export/import-modal-address";
import { ImportEmployeeBankDetailsModal } from "@/components/employees/import-export/import-modal-bank-details";
import { ImportEmployeeDetailsModal } from "@/components/employees/import-export/import-modal-employee-details";
import { ImportEmployeeGuardiansModal } from "@/components/employees/import-export/import-modal-guardians";
import { ImportEmployeeProjectAssignmentModal } from "@/components/employees/import-export/import-modal-project-assignments";
import { ImportEmployeeStatutoryModal } from "@/components/employees/import-export/import-modal-statutory";
import { columns } from "@/components/employees/table/columns";
import { DataTable } from "@/components/employees/table/data-table";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix } from "@/constant";
import { generateEmployeeFilter } from "@/utils/ai/employee";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  type EmployeeFilters,
  getEmployeesByCompanyId,
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
} from "@remix-run/react";
import { Suspense } from "react";

const pageSize = LAZY_LOADING_LIMIT;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  try {
    const url = new URL(request.url);
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");

    const query = searchParams.get("name") ?? null;

    const filters: EmployeeFilters = {
      dob_start: searchParams.get("dob_start") ?? null,
      dob_end: searchParams.get("dob_end") ?? null,
      education: searchParams.get("education") ?? null,
      gender: searchParams.get("gender") ?? null,
      status: searchParams.get("status") ?? null,
      project: searchParams.get("project") ?? null,
      project_site: searchParams.get("project_site") ?? null,
      assignment_type: searchParams.get("assignment_type") ?? null,
      position: searchParams.get("position") ?? null,
      skill_level: searchParams.get("skill_level") ?? null,
      doj_start: searchParams.get("doj_start") ?? null,
      doj_end: searchParams.get("doj_end") ?? null,
      dol_start: searchParams.get("dol_start") ?? null,
      dol_end: searchParams.get("dol_end") ?? null,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const employeesPromise = getEmployeesByCompanyId({
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

    const projectPromise = getProjectNamesByCompanyId({
      supabase,
      companyId,
    });

    let projectSitePromise = null;
    if (filters.project) {
      projectSitePromise = getSiteNamesByProjectName({
        supabase,
        projectName: filters.project,
      });
    }
    return defer({
      employeesPromise: employeesPromise as any,
      projectPromise,
      projectSitePromise,
      query,
      filters,
      companyId,
      env,
    });
  } catch (error) {
    console.error("Employees Error in loader function:", error);

    return defer({
      employeesPromise: Promise.resolve({ data: [] }),
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
  return clientCaching(
    `${cacheKeyPrefix.employees}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;

    const { object } = await generateEmployeeFilter({ input: prompt });

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(object)) {
      if (value !== null && value !== undefined && String(value)?.length) {
        searchParams.append(key, value.toString());
      }
    }

    url.search = searchParams.toString();

    return redirect(url.toString());
  } catch (error) {
    console.error("Employees Error in action function:", error);

    const fallbackUrl = new URL(request.url);
    fallbackUrl.search = "";
    return redirect(fallbackUrl.toString());
  }
}

export default function EmployeesIndex() {
  const {
    employeesPromise,
    projectPromise,
    projectSitePromise,
    query,
    filters,
    companyId,
    env,
  } = useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="p-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-2 mr-4">
          <Suspense fallback={<LoadingSpinner />}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={projectSitePromise}>
                  {(projectSiteData) => (
                    <>
                      <EmployeesSearchFilter
                        disabled={!projectData?.data?.length && noFilters}
                        projectArray={
                          projectData?.data?.length
                            ? projectData?.data?.map((project) => project!.name)
                            : []
                        }
                        projectSiteArray={
                          projectSiteData?.data?.length
                            ? projectSiteData?.data?.map((site) => site!.name)
                            : []
                        }
                      />
                      <FilterList filterList={filterList} />
                    </>
                  )}
                </Await>
              )}
            </Await>
          </Suspense>
        </div>
        {/* <EmployeesActions
          isEmpty={!projectPromise}
          emails={}
        /> */}
      </div>
      <Suspense fallback={<LoadingSpinner className="h-1/3" />}>
        <Await resolve={employeesPromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.employees);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load employees"
                />
              );
            }

            const hasNextPage = Boolean(meta?.count > data?.length);

            return (
              <DataTable
                data={data ?? []}
                columns={columns({ env, companyId })}
                count={meta?.count ?? 0}
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
        <ImportEmployeeDetailsModal />
        <ImportEmployeeStatutoryModal />
        <ImportEmployeeBankDetailsModal />
        <ImportEmployeeAddressModal />
        <ImportEmployeeGuardiansModal />
        <ImportEmployeeProjectAssignmentModal />
        <Outlet />
      </Suspense>
    </section>
  );
}

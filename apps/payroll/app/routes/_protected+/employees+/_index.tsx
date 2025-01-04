import { EmployeesActions } from "@/components/employees/employee-actions";
import { EmployeesSearchFilter } from "@/components/employees/employee-search-filter";
import { FilterList } from "@/components/employees/filter-list";
import { ImportEmployeeAddressModal } from "@/components/employees/import-modal-address";
import { ImportEmployeeBankingModal } from "@/components/employees/import-modal-banking";
import { ImportEmployeeGuardiansModal } from "@/components/employees/import-modal-guardians";
import { ImportEmployeePersonalsModal } from "@/components/employees/import-modal-personals";
import { ImportEmployeeStatutoryModal } from "@/components/employees/import-modal-statutory";
import { columns } from "@/components/employees/table/columns";
import { DataTable } from "@/components/employees/table/data-table";
import { VALID_FILTERS } from "@/constant";
import { AIChat4o } from "@/utils/ai";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  type EmployeeFilters,
  getEmployeesByCompanyId,
  getProjectNamesByCompanyId,
  getSiteNamesByProjectName,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { extractJsonFromString } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, redirect, useLoaderData } from "@remix-run/react";

const pageSize = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const page = 0;

  const searchParams = new URLSearchParams(url.searchParams);
  const sortParam = searchParams.get("sort");

  const query = searchParams.get("name") ?? undefined;

  const filters: EmployeeFilters = {
    dob_start: searchParams.get("dob_start") ?? undefined,
    dob_end: searchParams.get("dob_end") ?? undefined,
    education: searchParams.get("education") ?? undefined,
    gender: searchParams.get("gender") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    project: searchParams.get("project") ?? undefined,
    project_site: searchParams.get("project_site") ?? undefined,
    assignment_type: searchParams.get("assignment_type") ?? undefined,
    position: searchParams.get("position") ?? undefined,
    skill_level: searchParams.get("skill_level") ?? undefined,
    doj_start: searchParams.get("doj_start") ?? undefined,
    doj_end: searchParams.get("doj_end") ?? undefined,
    dol_start: searchParams.get("dol_start") ?? undefined,
    dol_end: searchParams.get("dol_end") ?? undefined,
  };

  const hasFilters =
    filters &&
    Object.values(filters).some(
      (value) => value !== null && value !== undefined
    );

  const { data, meta, error } = await getEmployeesByCompanyId({
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

  const hasNextPage = Boolean(
    meta?.count && meta.count / (page + 1) > pageSize
  );

  if (error) {
    throw error;
  }

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

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return json({
    data: data as any,
    count: meta?.count,
    query,
    filters,
    hasNextPage,
    companyId,
    projectArray: projectData?.map((project) => project.name) ?? [],
    projectSiteArray: projectSiteData?.map((site) => site.name) ?? [],
    env,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;

  const completion = await AIChat4o({
    messages: [
      {
        role: "system",
        content: `You are a strict filter extraction assistant. Your task is to convert user-provided filter queries into a JSON object strictly using the defined filters below. 

Current date: ${new Date().toISOString().split("T")[0]}

### VALID FILTERS
${VALID_FILTERS.map(
  (filter) =>
    `name: "${filter.name}", type: "${filter.valueType}", description: "${
      filter.description
    }", example: ${JSON.stringify(filter.example)}`
).join("\n")}

### RULES
1. **ONLY** use filters from the provided list. Ignore all other filter names.
2. Each filter must strictly match the name and type defined above.
3. **Date filters** (e.g., 'dob_start', 'doj_start'):
   - Always use date ranges with both 'start' and 'end'.
   - If 'end' is provided without a 'start', use the date of '1947-08-15' as 'start'.
   - If 'start' is provided without an 'end', use today's date as the end.
   - 'end' date can never be before 'start', and never give 'end' filter without 'start' if that is the case, remove 'end' filter.
4. **Output**:
   - Return a single JSON object with key-value pairs.
   - Omit filters with missing, unclear, or invalid values.
5. Strictly, Do not generate filters outside the predefined list, even if the user input suggests them.
6. Always validate against the valueType and examples provided and only return if it matches that.

### EXAMPLES
Input: "Find active employees with Bachelor's degree who joined after 2021"
Output: {
  "status": "active",
  "education": "graduate",
  "doj_start": "2021-01-01"
}
  Input: "Find iactive employees with Master's degree who joined before 2021"
  Output: {
  "status": "inactive",
  "education": "post_graduate",
  "doj_start": "1947-08-15"
  "doj_end": "2021-01-01"
}
`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  const validatedContent = extractJsonFromString(content);

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(validatedContent) as any) {
    if (value !== null && value !== undefined && String(value)?.length) {
      if (key === "end" && !validatedContent?.start) {
        searchParams.append("start", "1947-08-15");
      }
      searchParams.append(key, value.toString());
    }
  }

  url.search = searchParams.toString();

  return redirect(url.toString());
}

export default function EmployeesIndex() {
  const {
    data,
    count,
    query,
    filters,
    hasNextPage,
    companyId,
    projectArray,
    projectSiteArray,
    env,
  } = useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="py-6 px-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <EmployeesSearchFilter
            disabled={!data?.length && noFilters}
            projectArray={projectArray}
            projectSiteArray={projectSiteArray}
          />
          <FilterList filterList={filterList} />
        </div>
        <EmployeesActions isEmpty={!data?.length} />
      </div>
      <DataTable
        data={data ?? []}
        columns={columns({ env, companyId })}
        count={count ?? data?.length ?? 0}
        query={query}
        filters={filters}
        noFilters={noFilters}
        hasNextPage={hasNextPage}
        pageSize={pageSize}
        companyId={companyId}
        env={env}
      />
      <ImportEmployeePersonalsModal />
      <ImportEmployeeStatutoryModal />
      <ImportEmployeeBankingModal />
      <ImportEmployeeAddressModal />
      <ImportEmployeeGuardiansModal />
      <Outlet />
    </section>
  );
}

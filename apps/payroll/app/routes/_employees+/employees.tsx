import { EmployeesActions } from "@/components/employees/employee-actions";
import { EmployeesSearchFilter } from "@/components/employees/employee-search-filter";
import { FilterList } from "@/components/employees/filter-list";
import { columns } from "@/components/employees/table/columns";
import { DataTable } from "@/components/employees/table/date-table";
import { AIChat4o } from "@/utils/ai";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  type EmployeeFilters,
  getEmployeesByCompanyId,
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
    start: searchParams.get("start") ?? undefined,
    end: searchParams.get("end") ?? undefined,
    education: searchParams.get("education") ?? undefined,
    gender: searchParams.get("gender") ?? undefined,
    status: searchParams.get("status") ?? undefined,
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

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  return json({
    data,
    count: meta?.count,
    query,
    filters,
    hasNextPage,
    companyId,
    env,
  });
}

const VALID_FILTERS = ["name", "start", "end", "gender", "education", "status"];

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;
  const context = formData.get("context") as string | undefined;

  const completion = await AIChat4o({
    messages: [
      {
        role: "system",
        content: `Generate filters based on the prompt. Current date: ${
          new Date().toISOString().split("T")[0]
        }. Context: ${context || "None"}Valid filters: ${VALID_FILTERS.join(
          ", "
        )} Rules for parsing user input and generating filter object: 
          1. Use only the valid filter names provided in VALID_FILTERS.
          2. Interpret the input intelligently to map to appropriate filters.
          3. For gender and education filters:
          - Map terms like "graduate" to "graduate", "under graduate" to "under-graduate", "10th pass and all" to just "10th" , etc.
          - Replace spaces with hyphens in multi-word education levels.
          4. For status filter:
          - Interpret terms like "active" and "inactive".
          5. Date handling:
          - Always pair 'end' with 'start' to give a date range.
          - Never provide an 'end' filter alone.
          - Use date ranges for 'start' when appropriate 
          - Set end date to current date if no other end date is given by the user.
          6. Output format:
          - Return a single JSON object with string key-value pairs.
          - Omit filters with empty or unclear values.
          Example input: "Find active graduated employees born after 1990"
          Example output: {
            "status": "active",
            "education": "graduate",
            "start": "1990-01-01",
          }`,
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

export default function Employees() {
  const { data, count, query, filters, hasNextPage, companyId, env } =
    useLoaderData<typeof loader>();

  return (
    <section className='py-4'>
      <div className='w-full flex items-center justify-between pb-4'>
        <div className='flex w-[90%] flex-col md:flex-row items-start md:items-center gap-6'>
          <EmployeesSearchFilter />
          <FilterList filterList={{ ...filters, name: query }} />
        </div>
        <EmployeesActions isEmpty={!data?.length} />
      </div>
      <DataTable
        data={data ?? []}
        columns={columns}
        count={count ?? data?.length ?? 0}
        query={query}
        filters={filters}
        hasNextPage={hasNextPage}
        pageSize={pageSize}
        companyId={companyId}
        env={env}
      />
      <Outlet />
    </section>
  );
}

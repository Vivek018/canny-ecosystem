import { ChatboxComponent } from "@/components/chat/chatbox-component";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { generateQuery, runGeneratedSQLQuery } from "@/utils/ai/chat";
import { generateChartConfig } from "@/utils/ai/chat/chart";
import {
  clearCacheEntry,
  clearExactCacheEntry,
  clientCaching,
} from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import {
  getAllEmployeeTablesData,
  getChatByPromptAndUserId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { hasPermission, isGoodStatus, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";

const suggestedPrompts = [
  "Employees who started working after 2020",
  "Show employees completing more than 5 years of service in the next 6 months",
  "List employees with no address",
  "Employees missing emergency contact or guardian details",
  "City wise breakdown of employees with total count",
  "Employees with incomplete statutory details",
  "List employees whose birthdays are coming up this month",
  "List sites with gender distribution count individually",
  "Identify employees turning above 50 this calendar year",
  "Employees who have not been assigned to any project since joining",
  "List sites with number of local and outstation employees based on employee vs site location",
  "Predict which employees are due for a promotion based on tenure and education",
  "Employees with missing bank information",
  "Top 20 oldest employees",
  "Employees with post-graduate degrees and more than 10 years of work experience",
  "List all employees showing whether they are local or outstation based on their work location with their home city and work city",
];

export const employeeSystemPrompt = `
TABLES AND RELATIONSHIPS:
1. employees:
- Core table with profile info like employee_code, first_name, last_name, date_of_birth, gender, nationality, etc.
- Use first_name || ' ' || last_name AS full_name in queries.
- Use this table as the primary anchor when querying anything about employees.
- company_id is available for filtering by company.

2. employee_addresses:
- Contains residential address info for each employee.
- Use address_line_1, city, state, country, and pincode.
- is_primary = true helps choose the main address when multiple exist.
- Useful for geographic queries or comparing with site locations (e.g., local vs non-local employees).

3. employee_bank_details:
- Bank account info: bank_name, account_number, ifsc_code, branch_name, account_type.
- Useful when showing employee financial details, but do not expose account numbers directly unless needed for admin view.

4. employee_statutory_details:
- Statutory identifiers like aadhaar_number, pan_number, pf_number, uan_number.
- Used for compliance, reporting, audits.
- Join with employees via employee_id only when such legal information is required.

5. employee_guardians:
- Emergency contact or guardian data.
- Includes name, mobile_number, relationship, is_emergency_contact.
- address_same_as_employee = true means they live at the same address.
- Not always filled; use cautiously.

6. work_details:
- Captures all employee's work details - employee assignments to sites.
- Fields include: site_id, position, start_date, end_date, assignment_type (full_time, part_time), skill_level (skilled, unskilled), probation_period.
- Crucial for determining who worked where, when, and in what role.
- You can use this to analyze site-wise deployment, track probation status, or evaluate workforce distribution.
- Use this to JOIN project-level data, or to calculate how many employees worked at a site, or are currently assigned (if end_date IS NULL).

7. employeeWorkHistoryDetails  
- Historical job records for each employee.  
- Includes: previous position, company name, responsibilities, start_date, end_date.  
- Use to show prior experience, build resume views, or calculate total experience.  
- Queries: “Show all past positions for an employee”, “Show employees who worked at ‘XYZ Ltd.’ before joining”.  
- Join via employee_id

8. employeeSkillsDetails  
- Skills and proficiency levels for each employee.  
- Includes: skill_name, proficiency (e.g., beginner, intermediate), years_of_experience.  
- Use in queries like “Find skilled electricians”, “Filter employees with 3+ years in welding”, etc.  
- Join via employee_id

HOW TO USE:
• Always begin from employees table.
• Use joins with child tables (bank, address, work, statutory, etc.) when additional data is needed.
• Join depth can go up to 2 to 3 levels comfortably. For example, employees → work_details → sites.
• Prefer readable data (e.g., names, dates, positions) over IDs.
• If an employee has multiple rows in a child table (like multiple addresses), apply aggregation or filters (like is_primary = true).
• Use COALESCE to handle nulls where useful (e.g., COALESCE(middle_name, '') for full name).
• For geo-type queries (e.g., local vs non-local employees), compare employee city/state with site location.
`;

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${readRole}:${attribute.chat}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const prompt = searchParams.get("prompt") ?? "";
    let dataExistsInDb = false;

    if (!prompt) {
      return defer({
        prompt,
        query: null,
        data: [],
        config: null,
        error: null,
        dataExistsInDb,
      });
    }
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data: employeesData } = await getAllEmployeeTablesData({
      supabase,
    });
    const tablesData = JSON.stringify(employeesData);

    const promptWithCompany = `${prompt} where company is company_id=${companyId}`;

    if (prompt && user?.id) {
      const { data, status } = await getChatByPromptAndUserId({
        supabase,
        userId: user?.id ?? "",
        prompt: prompt,
      });

      if (data && isGoodStatus(status)) {
        dataExistsInDb = true;
      }
    }

    const { query, error } = await generateQuery({
      input: promptWithCompany,
      tablesData,
      companyId,
      systemPrompt: employeeSystemPrompt,
    });

    if (query === undefined || error) {
      return defer({
        prompt,
        query: null,
        data: null,
        config: null,
        error: error ?? "Error generating query",
        dataExistsInDb,
      });
    }

    const { data, error: sqlError } = await runGeneratedSQLQuery({
      originalQuery: query,
    });

    const { config } = await generateChartConfig(data ?? [], prompt);

    return defer({
      prompt,
      query,
      data,
      config,
      error: sqlError ?? null,
      dataExistsInDb,
    });
  } catch (error) {
    console.error("Error in action function:", error);
    return defer({
      prompt: null,
      query: null,
      data: null,
      config: null,
      error: error,
      dataExistsInDb: false,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const prompt = searchParams.get("prompt") ?? "";
  return clientCaching(`${cacheKeyPrefix.chatbox_employee}${prompt}`, args);
}
clientLoader.hydrate = true;

export default function EmployeeChat() {
  const { prompt, query, data, config, error, dataExistsInDb } =
    useLoaderData<typeof loader>();

  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearCacheEntry(cacheKeyPrefix.chatbox);
      clearExactCacheEntry(cacheKeyPrefix.chatbox_employee + prompt);
      toast({
        title: "Error",
        description:
          error ??
          "Failed to generate data from your prompt. Please try again.",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <ChatboxComponent
      query={query}
      suggestedPrompts={suggestedPrompts}
      data={data}
      config={config}
      returnTo={"/chat/chatbox/employee"}
      dataExistsInDb={dataExistsInDb}
    />
  );
}

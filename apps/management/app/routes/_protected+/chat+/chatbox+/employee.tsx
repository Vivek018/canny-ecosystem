import { ChatboxComponent } from "@/components/chat/chatbox-component";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { generateQuery, runGeneratedSQLQuery } from "@/utils/ai/chat";
import { generateChartConfig } from "@/utils/ai/chat/chart";
import { clearCacheEntry, clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getAllEmployeeTablesData, getChatByPromptAndUserId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { hasPermission, isGoodStatus, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { type ClientLoaderFunctionArgs, defer, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";

const suggestedPrompts = [
  "Employees who started working after 2020",
  "Show employees completing more than 5 years of service in April 2025",
  "Top 20 oldest employees",
  "List employees with no address",
  "Employees with missing bank information",
  "Employees missing emergency contact or guardian details",
  "City wise breakdown of employees with total count",
  "List employees whose birthdays are coming up this month",
  "List project sites with gender distribution count individually",
  "Identify employees turning above 50 this calendar year",
  "Employees who have not been assigned to any project since joining",
  "List project sites with number of local and outstation employees based on employee vs site location",
  "Predict which employees are due for a promotion based on tenure and education",
  "Employees with incomplete statutory details",
  "Employees with graduate degrees and more than 10 years of work experience",
  "List all employees showing whether they are local or outstation based on their work location with their home city and work city"
];

export const employeeSystemPrompt = `
DATA STRUCTURE & QUERY INSTRUCTIONS (for employee insights and analytics):

ANCHOR TABLE:
1. employees (core employee profile)
- Start all queries from this table.
- Key fields: employee_code, first_name, last_name, date_of_birth, gender, nationality, company_id.
- Use "first_name || ' ' || last_name" as full_name.
- Filter by company_id for company-specific queries.

CHILD TABLES & JOINING RULES:
2. employee_addresses
- Home address info: address_line_1, city, state, country, pincode.
- Use "is_primary = true" to get the main address.
- Compare address city/state with project site for local vs outstation queries.

3. employee_bank_details
- Fields: bank_name, account_number, ifsc_code, branch_name, account_type.
- Use only for financial views. Avoid showing account_number unless necessary.

4. employee_statutory_details
- Fields: aadhaar_number, pan_number, pf_number, uan_number.
- Used for compliance or statutory completeness checks.

5. employee_guardians
- Guardian or emergency contact info: name, mobile_number, relationship.
- "is_emergency_contact = true" to find emergency contacts.
- "address_same_as_employee = true" if they share the same home address.

6. employee_project_assignment
- Work deployment info: project_site_id, position, start_date, end_date, assignment_type, skill_level, probation_period.
- Use to track:
  • current assignment (end_date IS NULL),
  • probationary status,
  • workforce distribution,
  • employees without project history.

7. employeeWorkHistoryDetails
- Past jobs: position, company name, responsibilities, start_date, end_date.
- Used to evaluate total experience or find previous employers.

8. employeeSkillsDetails
- Skill info: skill_name, proficiency (beginner, intermediate, advanced), years_of_experience.
- Useful for skill-based filtering and workforce capability queries.
`;


export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${readRole}:${attribute.chat}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }
    
    const { data: employeesData } = await getAllEmployeeTablesData({ supabase });

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const prompt = searchParams.get("prompt") ?? "";
    let dataExistsInDb = false;

    if (!prompt) {
      return defer({ prompt, query: null, data: [], config: null, error: null, dataExistsInDb });
    }
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const tablesData = JSON.stringify(employeesData);


    const promptWithCompany = `${prompt} where company is company_id=${companyId}`

    if (prompt && user?.id) {
      const { data, status } = await getChatByPromptAndUserId({ supabase, userId: user?.id ?? "", prompt: prompt });

      if (data && isGoodStatus(status)) {
        dataExistsInDb = true;
      }
    }

    const { query, error } = await generateQuery({ input: promptWithCompany, tablesData, companyId, systemPrompt: employeeSystemPrompt });

    if (query === undefined || error) {
      return defer({ prompt, query: null, data: null, config: null, error: error ?? "Error generating query", dataExistsInDb });
    }

    const { data, error: sqlError } = await runGeneratedSQLQuery({ originalQuery: query });


    const { config } = await generateChartConfig(data ?? [], prompt);

    return defer({ prompt, query, data, config, error: sqlError ?? null, dataExistsInDb });
  } catch (error) {
    console.error("Error in action function:", error);
    return defer({ prompt: null, query: null, data: null, config: null, error: error, dataExistsInDb: false });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const prompt = searchParams.get("prompt") ?? "";
  return clientCaching(
    `${cacheKeyPrefix.chatbox_employee}${prompt}`,
    args
  );
}
clientLoader.hydrate = true;

export default function EmployeeChat() {
  const { prompt, query, data, config, error, dataExistsInDb } = useLoaderData<typeof loader>();

  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearCacheEntry(cacheKeyPrefix.chatbox)
      clearExactCacheEntry(cacheKeyPrefix.chatbox_employee + prompt)
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
  )
}

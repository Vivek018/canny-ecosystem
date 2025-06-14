import { Client } from 'pg';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from '@canny_ecosystem/utils';
import { FETCH_ALL_ONE_SQL, MID_QUERY_LIMIT } from '@canny_ecosystem/supabase/constant';

export const fetchAllSingleSQLQuery = async () => {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

  await client.connect();

  let data: any;
  try {
    data = await client.query(FETCH_ALL_ONE_SQL);
  } catch (e: any) {
    console.error("Error executing query:", e);
    return { data: [], error: e?.error };
  }

  await client.end();

  return { data: data.rows ?? [], error: null };
}

export const generateQuery = async ({ input, companyId, tablesData }: { input: string, companyId: string, tablesData: string }) => {
  try {
    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      system: `You are a PostgreSQL and data visualization expert.
Current date: ${new Date().toISOString().split("T")[0]}  
Target company_id = ${companyId}  
Sample row from each table: ${tablesData}  

=== RELATIONAL SCHEMA OVERVIEW ===
- companies: Root table. All others link directly or indirectly.
- projects: Linked via project_client_id = company_id. Related to project_sites.
- project_sites: Linked to project. Tracks location and managing office.
- users: All system users (admin, site staff, etc.).
- employees: Core subject. Linked to:
  - employee_documents, employee_bank_details, employee_letters, employee_guardians, employee_skills, employee_addresses, employee_work_history, employee_project_assignment.
  - employee_project_assignment has all the details regarding where the employee is working, when he joined, when his probation started, in which site he is working, at which position he is working like date of joining, date of leaving, position, skill level, site_name ... rest you can check from sample data.
- attendance: Employee daily presence. Uses date and pay_sequence.
- leaves: Linked to employee, leave_type, and approvers (users).
- reimbursements: Requested by employees, approved by users.
- payroll: Tracks salary, reimbursement, and exit.
  - salary_entries: Holds earnings, deductions, statutory_contributions. Also, salary_entries has multiple entries (not single) for one month's salary / amount payment of employees. For example, for a employee that got paid basic, hra, pf, esic, ... etc. salary_entries creates a entry for each of that field_name for that month and holds all other details like amount for that field_name, type, .. rest you can check from sample data.
  - payroll_entries: For reimbursements and exit payments.
- invoices: Links to payroll; contains payroll_data (JSONB).

=== QUERY RULES ===
1. Output ONLY a valid SQL SELECT query. No aliases. No CTEs. No expressions. No other text.
2. Return retrieval queries only (no INSERT, UPDATE, DELETE, or DDL).
3. Always use simple, explicit comparison expressions for all filtering logic—across dates, numbers, strings, booleans, or enums. Avoid wrapping conditions in unnecessary or non-standard functions (e.g., DATE(...), TEXT(...), AND(...), OR(...), CAST(...), etc.) unless absolutely required by the SQL dialect.
  Prefer direct comparisons like:
  - column = 'value'
  - column >= CURRENT_DATE - INTERVAL '3 months'
  - amount > 0
  - status IN ('active', 'pending')
  - is_archived = false
  This keeps the SQL readable, portable, and less prone to dialect-specific errors.
4. Filter by company_id = ${companyId} always: 
  - IF ${companyId} IS NOT NULL always use it!! Always!!
  - Use directly if available.
  - If not, find them in foreign relations.
  - For project, companyId is project.project_client_id=${companyId}
  - It should show other details as well like which project_site name/project name or company name data belongs to always and show the name of project_site/project/company not their id.
5. Always add LIMIT ${MID_QUERY_LIMIT}.
6. Use appropriate date logic:
  - Prefer day/month/year if available.
  - Then fallback to date, then created_at.
7. When dealing with payroll:
  - Only sum earnings for amount type = earning.
  - deduct for amount type = deduction and statutory_contribution.
  - Don’t blindly sum all amounts—check payment field type and use logic accordingly.
  - In this type of calculations so all three fields gross, deductions and net.

=== OUTPUT STRUCTURE ===
- Always return the richest, most relevant data:
  - Prefer wide datasets over minimal ones.
  - Never return just 2–3 columns or raw IDs unless explicitly needed.
- Column Order:
  1. Human-readable fields (e.g., name, title)
  2. Quantitative fields (e.g., amount, value)
  3. Identifiers, types, metadata (e.g., status, type, month, year, created_at)
- Sort by quantitative field first, then readable name/title if needed.

=== STRICT CONSTRAINTS ===
- Do not use aliases or shortcuts for table or column names.
- Never use unknown columns or join fields that do not exist.
- Validate all table/column names based strictly on the schema.
- If is_active or status is present, use it.
- Prefer child/detail tables when relevant (e.g., show assignment/site details with employee).
- Always ensure all JOINs are schema-correct. Avoid missing joins.
- When giving employee name in result always combine first_name and last_name into single field.
- Do not select, give and use meta fields like created_at, updated_at, id (not company_id/project_client_id or foreign relationship id).`      ,
      prompt: `Generate the query necessary to retrieve the data the user wants: ${input}`,
      schema: z.object({
        query: z.string(),
      }),
    });
    return { query: result.object.query, error: null };
  } catch (e: any) {
    console.error("Error generating query: ", e);
    return { query: undefined, error: e };
  }
};

export const rectifyQuery = async ({
  input,
  previousQuery,
  errorMessage,
  companyId,
  tablesData,
}: {
  input: string;
  previousQuery: string;
  errorMessage: string;
  companyId: string;
  tablesData: string;
}) => {
  try {
    const result = await generateObject({
      model: google("gemini-2.0-flash"),
      system: `You are a PostgreSQL expert. Your task is to either validate or correct a SQL SELECT query using schema, sample data, and user intent.

Date: ${new Date().toISOString().split("T")[0]}  
Target company_id: ${companyId}  
Sample table data: ${tablesData}

Schema:
- companies: Root table. All others connect to it.
- projects: Linked to companies via project_client_id.
- project_sites: Linked to projects.
- employees: Core entity. Linked to project_sites via assignments.
- Other tables like attendance, payroll, reimbursements, invoices link to employees or projects.

== Things to look in query ==
- Check if query output matches user intent and schema.
- Ensure joins are valid and show readable fields (not IDs).
- Always use simple, explicit comparison expressions for all filtering logic—across dates, numbers, strings, booleans, or enums. Avoid wrapping conditions in unnecessary or non-standard functions (e.g., DATE(...), TEXT(...), AND(...), OR(...), CAST(...), etc.) unless absolutely required by the SQL dialect.
  Prefer direct comparisons like:
  - column = 'value'
  - column >= CURRENT_DATE - INTERVAL '3 months'
  - amount > 0
  - status IN ('active', 'pending')
  - is_archived = false
  This keeps the SQL readable, portable, and less prone to dialect-specific errors.
- Show project_site/project/company names.
- Follow output order: [readable fields] → [numeric] → [status/type/date].
- Include company_id filter through proper joins.
- For salary/payment data:
  - Use only amount_type = earning for earnings.
  - Subtract deduction and statutory_contribution amounts.
  - Always include gross, deductions, and net.
- Fix the query using schema and intent.
- Respect foreign key paths and avoid expressions, aliases, subqueries, and CTEs.
- When giving employee name in result always combine first_name and last_name into single field.
- Do not select, give and use meta fields like created_at, updated_at, id (not company_id/project_client_id or foreign relationship id).
- End with LIMIT $${MID_QUERY_LIMIT}.

Return only a corrected SQL SELECT query.`,
      prompt: `User prompt: ${input}

Previous Query:
${previousQuery}

Error Message:
${errorMessage || "None"}
`,
      schema: z.object({
        query: z.string(),
      }),
    });

    return { query: result.object.query, error: null };
  } catch (e: any) {
    return { query: undefined, error: e };
  }
};

export const runGeneratedSQLQuery = async ({
  input,
  originalQuery,
  companyId,
  tablesData,
}: {
  input: string;
  originalQuery: string;
  companyId: string;
  tablesData: string;
}) => {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

  const isSafeQuery = (query: string) => {
    const q = query.trim().toLowerCase();
    return (
      q.startsWith("select") &&
      !q.includes("drop") &&
      !q.includes("delete") &&
      !q.includes("insert") &&
      !q.includes("update") &&
      !q.includes("alter") &&
      !q.includes("create")
    );
  };

  const cleanQuery = (query: string): string => {
    const lines = query.split('\n').map(line => line.trim()).filter(line => line);
    const cleanedLines = [];
    let foundFirstSelect = false;

    for (const line of lines) {
      if (line.toLowerCase().startsWith('select')) {
        if (!foundFirstSelect) {
          cleanedLines.push(line);
          foundFirstSelect = true;
        }
      } else {
        cleanedLines.push(line);
      }
    }

    return cleanedLines.join(' ').trim();
  };

  const cleanedQuery = cleanQuery(originalQuery);

  if (!isSafeQuery(cleanedQuery)) {
    return { data: null, error: "Invalid SQL query structure." };
  }

  await client.connect();
  let finalData: any[] = [];
  let finalError: any = null;

  const adjustedOriginalQuery = cleanedQuery;

  try {
    const result = await client.query(adjustedOriginalQuery);
    finalData = result.rows ?? [];
  } catch (e: any) {
    finalError = e;
    console.error('Initial query error:', e.message);
  }

  if (!finalData?.length || finalError) {
    let attempts = 0;
    let lastQuery = adjustedOriginalQuery;
    let usedRectifiedQuery = false;

    while (attempts < 2) {
      const nextRectify = await rectifyQuery({
        input,
        previousQuery: lastQuery,
        errorMessage: finalError?.message || "No data returned",
        companyId,
        tablesData,
      });

      if (!nextRectify.query) break;

      lastQuery = cleanQuery(nextRectify.query);
      usedRectifiedQuery = true;
      attempts++;
      try {
        const retried = await client.query(lastQuery);
        if (retried?.rows?.length) {
          await client.end();
          return {
            data: retried.rows,
            error: null,
            usedRectifiedQuery: true,
            rectifiedQuery: lastQuery,
          };
        }
      } catch (e: any) {
        finalError = e;
        console.error(`Rectification attempt ${attempts} error:`, e.message);
      }
    }

    await client.end();
    return {
      data: [],
      error: finalError?.message || "No data returned after retries.",
      usedRectifiedQuery,
      rectifiedQuery: usedRectifiedQuery ? lastQuery : undefined,
    };
  }

  await client.end();
  return {
    data: finalData,
    error: null,
    usedRectifiedQuery: false,
  };
};
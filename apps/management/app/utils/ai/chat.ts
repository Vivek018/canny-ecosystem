import { Client } from 'pg';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from '@canny_ecosystem/utils';
import { FETCH_ALL_ONE_SQL, MID_QUERY_LIMIT } from '@canny_ecosystem/supabase/constant';

export const generateQuery = async ({ input, companyId, tablesData }: { input: string, companyId: string, tablesData: string }) => {
  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
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
  - employee_project_assignment → project_site → project → company.
- attendance: Employee daily presence. Uses date and pay_sequence.
- leaves: Linked to employee, leave_type, and approvers (users).
- reimbursements: Requested by employees, approved by users.
- payroll: Tracks salary, reimbursement, and exit.
  - salary_entries: Holds earnings, deductions, statutory_contributions.
  - payroll_entries: For reimbursements and exit payments.
- invoices: Links to payroll; contains payroll_data (JSONB).

=== QUERY RULES ===
1. Output ONLY a valid SQL SELECT query. No aliases. No CTEs. No expressions. No other text.
2. Return retrieval queries only (no INSERT, UPDATE, DELETE, or DDL).
3. Filter by company_id = ${companyId} always: 
  - IF ${companyId} IS NOT NULL always use it!! Always!!
  - Use directly if available.
  - If not, join via employee → site → project → project.project_client_id = company_id.
4. Always add LIMIT ${MID_QUERY_LIMIT}.
5. Use appropriate date logic:
  - Prefer day/month/year if available.
  - Then fallback to date, then created_at.

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
- Avoid subqueries, expressions (CASE, EXTRACT), JSON parsing, or formatting.
- If is_active or status is present, use it.
- Prefer child/detail tables when relevant (e.g., show assignment/site details with employee).
- Always ensure all JOINs are schema-correct. Avoid missing joins.

=== EXAMPLES OF STRONG OUTPUT ===
- Site-wise attendance: site name, project name, date, present count, absent count, etc.
- payroll: title, total earnings, total deductions, net, etc.
- Missing documents: employee name, document_type, file_url IS NULL.
- Top absentees last month: employee name, mobile, site, total absents.
- Approved reimbursements: employee, amount, status, approved_by, approved_at.`      ,
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
      model: openai("gpt-4o-mini"),
      system: `You are a PostgreSQL expert. Your task is to FIX and REWRITE a failed SQL SELECT query based on the user's request, schema, and error feedback.
Current date: ${new Date().toISOString().split("T")[0]}  
Target company_id = ${companyId}  
Sample row from each table: ${tablesData}  

=== RELATIONAL SCHEMA ===
- companies: Root table. All tables link to it directly or via other tables.
- projects: Linked to companies via project_client_id.
- project_sites: Linked to projects.
- employees: Core table. Linked to many child tables and to project_sites via assignments.
- attendance, leaves, payroll, reimbursements, invoices, etc. are all related to employees or projects.

=== YOUR TASK ===
- You are given a user request, a failed SQL SELECT query, and its error message.
- Fix the query to make it syntactically and logically correct based on the schema.
- Return the corrected SQL SELECT query that:
  1. Uses correct and existing table + column names.
  2. Returns relevant fields for visualization (prefer readable and useful columns).
  3. Follows this output column order: [human-readable] → [numeric/amount] → [status/type/ID/date].
  4. Always applies company_id = ${companyId} filter if relevant.
  5. Does not use aliases, subqueries, CTEs, CASE, EXTRACT, or JSON parsing.
  6. Joins correctly, fully respects foreign key paths, and returns usable results.
  7. Always ends with LIMIT 100.
  8. Doesn't apply my sorting rules.

EXAMPLES:
- Wrong join → fix and return correct join.
- Wrong column → swap for real column.
- Missing fields → add relevant readable fields from joins.
- Didn't follow my instructions 

Only output the corrected SQL SELECT query. Do not explain anything.`,
      prompt: `User prompt: ${input}
Previous failed query:
${previousQuery}

Query error message:
${errorMessage}

Now generate a corrected SQL SELECT query.`,
      schema: z.object({
        query: z.string(),
      }),
    });

    return { query: result.object.query, error: null };
  } catch (e: any) {
    console.error("Error correcting query: ", e);
    return { query: undefined, error: e };
  }
};


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

  // Basic validation
  const isSafeQuery = (query: string) => {
    const q = query.trim().toLowerCase();
    return (
      q.startsWith("select") &&
      !q.includes("drop") &&
      !q.includes("delete") &&
      !q.includes("insert")
    );
  };

  if (!isSafeQuery(originalQuery)) {
    return { data: null, error: "Invalid SQL query structure." };
  }

  await client.connect();

  let initialData: any;
  let executionError: any = null;

  try {
    initialData = await client.query(originalQuery);
  } catch (e: any) {
    console.error("Initial SQL execution failed:", e);
    executionError = e;
  }

  // If error occurred or empty data, try to rectify
  if (executionError || initialData?.rows?.length === 0) {
    const { query: correctedQuery, error: rectificationError } = await rectifyQuery({
      input,
      previousQuery: originalQuery,
      errorMessage: executionError?.message || "No data returned",
      companyId,
      tablesData,
    });

    if (!correctedQuery) {
      return { data: [], error: rectificationError || "Unable to generate corrected query." };
    }

    try {
      const rectifiedData = await client.query(correctedQuery);
      await client.end();
      return {
        data: rectifiedData.rows ?? [],
        error: null,
        usedRectifiedQuery: true,
        rectifiedQuery: correctedQuery,
      };
    } catch (e: any) {
      console.error("Rectified SQL execution also failed:", e);
      await client.end();
      return { data: [], error: e?.message || "Error in corrected query." };
    }
  }

  await client.end();
  return {
    data: initialData?.rows ?? [],
    error: null,
    usedRectifiedQuery: false,
  };
};
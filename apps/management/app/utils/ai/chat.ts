import { Client } from 'pg';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from '@canny_ecosystem/utils';
import { SOFT_QUERY_LIMIT, TABLE_SQL_SCHEMA } from '@canny_ecosystem/supabase/constant';

export const generateQuery = async ({ input, companyId }: { input: string, companyId: string }) => {
  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `You are a PostgreSQL and data visualization expert.
      Current date is: ${new Date().toISOString().split("T")[0]}  
      company_id = ${companyId}  
      Table SQL Schema definition: ${TABLE_SQL_SCHEMA}
== CONTEXTUAL SCHEMA HIERARCHY AND RELATIONSHIPS ==
1. companies:
    - Root table of the schema.
    - Every table is directly or indirectly linked to it.
    - Related tables: company_registration_details, company_locations, company_relationships, company_documents.
2. projects:
    - Linked to companies via primary_contractor_id (equivalent to company_id).
    - Related tables: project_sites (project location), and many others linked via site.
    - project_site is also linked to company_location for tracking managing office.
3. users:
    - All system users (admins, company staff, site supervisors, etc.) with roles.
4. employees:
    - Most important table.
    - Related tables: employee_documents, employee_bank_details, employee_letters, employee_guardians, employee_skills, employee_addresses, employee_work_history, employee_project_assignment.
    - employee_project_assignment links employees to their project site.
5. attendance:
    - Daily attendance data of employees.
    - pay_sequence helps define pay periods.
6. leaves:
    - Employee leave records.
    - Linked to leave_type, approvers (users), and leave availability.
7. reimbursements:
    - Requested reimbursements by employees.
    - Also tracks approvers.
8. exit:
    - Exit-related info (final payments, etc.) for employees.
9. payroll:
    - Core payment table.
    - Three types: salary, reimbursement, exit.
    - Related tables:
      - salary_entries (by payment field, type("earning", "deduction", "statutory_contribution"), month, year)
      - payroll_entries (for, reimbursement and exit)
10. invoices:
    - Holds invoice-level info of payrolls in a company.
    - Key JSONB field: payroll_data.
    
== QUERY INSTRUCTIONS ==
    1. Only generate a **valid SQL SELECT** query. Return nothing else.
    2. Only generate **retrieval** queries. No INSERT, UPDATE, DELETE, or DDL.
    3. Always add LIMIT ${SOFT_QUERY_LIMIT} to restrict row count.
    4. Use appropriate date logic:
        - Prefer numeric fields like day, month, year if available.
        - Else use date, then created_at, and only fallback if necessary.
    5. Filter by company_id = ${companyId}:
        - Directly if table has company_id.
        - Else join through employee, project_site, project, or other foreign keys back to companies(id).
        - In some cases, company_id may be under different name like project_client_id (e.g., in projects).
    6. If is_active or status fields are available, prefer whichever one is actually in the table.
    7. Prioritize relevance of child/nested tables over parent/main when needed.
== UNIVERSAL RULES FOR ALL TABLES AND QUERY TYPES ==
    - If a prompt requests employee's data for payment related stuff or similar:
      - Always return **comprehensive salary details**, not just amount.
      - Include fields from related tables such as:
        - employee: first_name, middle_name, last_name, etc.
        - salary_entries: field_name, field_type (earning/deduction/bonus/statutory_contribution), amount, month, year.
      - Calculate **net amount** as:
        - total_earning = SUM(amount WHERE type = 'earning' OR type = 'bonus')
        - total_deductions = SUM(amount WHERE type = 'deduction' OR type = 'statutory_contribution')
        - net_amount = total_earning - total_deductions
      - For gross salary, only sum earning types and give that as result.
      - Do not simply return total amount. Follow the above logic for any similar request involving salary/payroll.
== OUTPUT COLUMN ORDERING RULE ==
    - All result columns must follow a consistent and logical order:
      1. **Human-readable fields first** (e.g., employee_name, project_name, department, title)
      2. **Informative quantitative fields next** (e.g., amount, balance, count, percentage)
      3. **Identifiers, types, and metadata last** (e.g., status, type, month, year, created_at)
    - Always use quantitative field for sorting, only then use human readable fields first.
    - Never start output with technical or raw ID fields.
    - This column order must be respected in all queries for better UX and charting readability.
== BEST-FORM QUERY RULE ==
    - Do not settle for minimal results (e.g., 2–3 columns or raw counts only).
    - Every query should return the **richest set of useful and readable fields** available through joins.`
      ,
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

export const runGeneratedSQLQuery = async (query: string | null | undefined) => {
  if (
    !query?.trim().toLowerCase().startsWith("select") ||
    query?.trim().toLowerCase().includes("drop") ||
    query?.trim().toLowerCase().includes("delete") ||
    query?.trim().toLowerCase().includes("insert")
  ) {
    return { data: null, error: "Invalid query" };
  }

  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

  await client.connect();

  let data: any;

  try {
    data = await client.query(query);
  } catch (e: any) {
    console.error("Error executing query:", e);
    return { data: [], error: e?.error };
  }

  await client.end();

  return { data: data.rows ?? [], error: null };
}
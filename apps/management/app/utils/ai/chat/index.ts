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
      system: `PostgreSQL query generator. Return only SELECT statements.

  CONTEXT: Date: ${new Date().toISOString().split("T")[0]} | Company: ${companyId} | Schema: ${tablesData}

REQUIREMENTS:
• Output: SELECT only
• Filter: Always company_id = '${companyId}' (or project.project_client_id for projects)
• Limit: Add LIMIT ${MID_QUERY_LIMIT}
• Security: No INSERT/UPDATE/DELETE/DDL

STANDARDS:
• Use direct simple comparisons for filtering in sql that can be understood by pg library.
• Employee names: first_name || ' ' || last_name AS full_name
• Date priority: day/month/year → date → created_at
• Rich results: Include names, amounts, status (not just IDs)
• Sort: quantitative first, then alphabetical
• Exclude meta fields: created_at, updated_at, id, etc.

COMPANY FILTERING:
• Use company_id directly if available
• Projects: Has instad of company_id, it has project_client_id.
• Follow foreign keys to filter by company

  EMPLOYEE DATA:
• Basic employee details (from employees table)
• Employee tables start with "employee_". Use these to build joins and enrich data.
• employee_project_assignment: working details (project_site, position, start_date, end_date, probation_period, probation_end_date, ...check table sample data).
• For work details: JOIN employees with employee_project_assignment
    
  PAYROLL SYSTEM:
payroll (types: salary, reimbursement, exit, other)

SALARY_ENTRIES:
• Earnings: basic,hra,lta,conveyance,medical,special_allowance,overtime,shift_allowance (type='earning')
• Bonus: performance_bonus,festival_bonus,annual_bonus,incentive (type='bonus')
• Deductions: advance,loan_deduction,salary_deduction,fine,other_deduction (type='deduction')
• Statutory: pf,esic,pt,lwf,tds,income_tax,professional_tax (type='statutory_contribution')

Query patterns:
"pf amount" → field_name='pf'+type='statutory_contribution'
"basic salary" → field_name='basic'+type='earning'
"statutory" → type='statutory_contribution'
"deductions" → type IN ('deduction','statutory_contribution')
"gross" → type IN ('earning','bonus')

Calc: Gross=SUM(earning+bonus), Deductions=SUM(deduction+statutory), Net=Gross-Deductions
Show: employee name, field_name, amount, type, month, year, present_days, overtime_hours

REIMBURSEMENT: employee name, amount, status, is_deductible, submitted_date
EXIT: employee name, net_pay, leave_encashment, gratuity, deduction, bonus, last_working_day, final_settlement_date, reason
SUMMARY: title, total_net_amount, total_employees, payroll_type, status, run_date
`,
      prompt: `User Request: "${input}"`,
      temperature: 0.1,
      schema: z.object({
        query: z.string(),
      }),
    });
    return { query: result.object.query, error: null };
  } catch (e: any) {
    console.error("Error generating query: ", e);
    return { query: undefined, error: e.message };
  }
};

export const runGeneratedSQLQuery = async ({
  originalQuery,
}: {
  originalQuery: string;
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
    const lines = query
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const cleanedLines = [];
    let foundFirstSelect = false;

    for (const line of lines) {
      if (line.toLowerCase().startsWith("select")) {
        if (!foundFirstSelect) {
          cleanedLines.push(line);
          foundFirstSelect = true;
        }
      } else {
        cleanedLines.push(line);
      }
    }

    return cleanedLines.join(" ").trim();
  };

  const cleanedQuery = cleanQuery(originalQuery);

  if (!isSafeQuery(cleanedQuery)) {
    return { data: null, error: "Invalid SQL query structure." };
  }

  await client.connect();
  let finalData: any[] = [];
  let finalError: any = null;

  try {
    const result = await client.query(cleanedQuery);
    finalData = result.rows ?? [];
  } catch (e: any) {
    finalError = e;
    console.error("Initial query error:", e.message ?? e);
  }

  await client.end();
  return {
    data: finalData,
    error: finalError ? (finalError.message ?? finalError) : null,
  };
};

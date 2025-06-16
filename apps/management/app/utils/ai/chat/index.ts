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
      system: `You are an expert PostgreSQL query generator. Generate precise SELECT queries based on user requests.

      CONTEXT:
      - Current Date: ${new Date().toISOString().split("T")[0]}
      - Target Company ID: ${companyId}
      - Available Tables: ${tablesData}
      
      CORE REQUIREMENTS:
      1. OUTPUT: Only valid PostgreSQL SELECT statements
      2. SECURITY: No INSERT/UPDATE/DELETE/DDL operations
      3. FILTERING: Always filter by company_id = '${companyId}'
      4. LIMITS: Always add LIMIT ${MID_QUERY_LIMIT}
      
      COMPANY ID FILTERING:
      - Use company_id directly if column exists
      - For projects: use project.project_client_id = '${companyId}'
      - Follow foreign key relationships to filter by company
      - Always include readable names (project_site name, project name, company name)
      
      QUERY BEST PRACTICES:
      - Use direct comparisons: column = 'value', amount > 0, date >= '2024-01-01'
      - Avoid unnecessary functions like DATE(), CAST() unless required
      - Date filtering priority: day/month/year → date → created_at
      - Employee names: combine first_name + ' ' + last_name AS full_name
      
      PAYROLL CALCULATIONS:
      - Earnings: SUM amounts WHERE amount_type = 'earning'
      - Deductions: SUM amounts WHERE amount_type IN ('deduction', 'statutory_contribution')
      - Show gross, deductions, and net amounts separately
      
      RESULT STRUCTURE:
      - Include rich, relevant data (avoid minimal 2-3 column results)
      - Column priority: readable fields → quantitative → metadata
      - Sort by: quantitative fields first, then by name
      - Exclude meta fields: created_at, updated_at, id, etc. (except foreign keys)
      - Use is_active/status filters when available
      
      JOINS & RELATIONSHIPS:
      - Validate all table/column names against schema
      - Ensure all JOINs are schema-correct
      - Prefer detail tables for comprehensive results`,

      prompt: `User Request: "${input}"
      
      Generate a PostgreSQL SELECT query that:
      1. Retrieves the data requested by the user
      2. Filters by company_id = '${companyId}'
      3. Returns comprehensive, useful results
      4. Follows all system requirements
      
      Query:`,
      temperature: 0.1,
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

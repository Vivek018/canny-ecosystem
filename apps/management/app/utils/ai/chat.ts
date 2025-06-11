import { Client } from 'pg';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from '@canny_ecosystem/utils';
import { SOFT_QUERY_LIMIT, TABLE_SQL_SCHEMA } from '@canny_ecosystem/supabase/constant';

export const generateQuery = async ({ input, companyId }: { input: string, companyId: string }) => {
  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `You are an expert in PostgreSQL and data visualization. Your task is to generate optimized, valid SQL SELECT queries to retrieve quantitative data suitable for charting.
      The current table schema is as follows:
      ${TABLE_SQL_SCHEMA}
      Guidelines:
      1. Generate only a valid SQL SELECT query. Do not include any explanations, comments, or additional text.
      2. Never use table aliases or column aliases. Always use full table and column names exactly as defined in the schema.
      3. Only generate retrieval (SELECT) queries. No INSERT, UPDATE, DELETE, or DDL operations.
      4. Every query must return **at least two columns**:
      - One column should be a **dimension** (e.g., name, type, status, date).
      5. Always check the if the columns exists in the schema before using them.
      6. Ensure every column type is compatible with the data type of the column in the schema. i.e., date is not numeric.
      7. There are different columns in different table but use for same thing like in some tables there is is_active boolean column while in some there is status column with values like active, inactive, etc. So use the column which is available in the table.
      - The second must be a **quantitative value** (e.g., COUNT, SUM, AVG) so that the result can be plotted on a chart.
      - If the user requests only a single field, return that field and the count of its occurrences.
      5. Do not retrieve more than ${SOFT_QUERY_LIMIT} rows. Use LIMIT ${SOFT_QUERY_LIMIT} in every query.
      6. If company_id=${companyId} is defined, always filter the results by this company:
      - If the base table contains company_id, filter on it directly in the WHERE clause.
      - If not, traverse direct and indirect foreign key relationships (e.g., via employee_id, project_site_id, etc.) to join back to companies(id), and filter by companies.id=${companyId}. Also company_id can be in different form in the table like in project table, there is primary_contractor_id which is the company_id.
      7. Replace technical IDs and UUIDs with human-readable fields (e.g., names or titles) when available. Avoid selecting raw IDs in the final result unless requested.
      8. All outputs should be immediately usable for charting (e.g., bar charts, pie charts, time series).`,
      prompt: `Generate the query necessary to retrieve the data the user wants: ${input}`,
      schema: z.object({
        query: z.string(),
      }),
    });
    return { query: result.object.query, error: null };
  } catch (e: any) {
    console.error("Error generating query: ", e?.error);
    return { query: undefined, error: e };
  }
};

export const runGeneratedSQLQuery = async (query: string) => {
  if (
    !query.trim().toLowerCase().startsWith("select") ||
    query.trim().toLowerCase().includes("drop") ||
    query.trim().toLowerCase().includes("delete") ||
    query.trim().toLowerCase().includes("insert")
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
    console.error("Error executing query:");
    return { data: [], error: e?.error };
  }

  await client.end();

  return { data: data.rows ?? [], error: null };
}
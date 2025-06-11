import { Client } from 'pg';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from '@canny_ecosystem/utils';
import { SOFT_QUERY_LIMIT, TABLE_SQL_SCHEMA } from '@canny_ecosystem/supabase/constant';

export const generateQuery = async ({ input, companyId }: { input: string, companyId: string }) => {
  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `You are a SQL (postgres) and data visualization expert. Your job is to help the user write a SQL query to retrieve the data they need. The table schema is as follows:
      ${TABLE_SQL_SCHEMA}.
      You will only generate the SQL query, nothing else. Do not include any explanations or additional text. Only retrieval queries are allowed. No query should retrieve more than ${SOFT_QUERY_LIMIT} rows.
      If company_id=${companyId} has a value, you should always filter the query by company_id=${companyId} in the WHERE clause.
      EVERY QUERY SHOULD RETURN QUANTITATIVE DATA THAT CAN BE PLOTTED ON A CHART! There should always be at least two columns. If the user asks for a single column, return the column and the count of the column.`,
      prompt: `Generate the query necessary to retrieve the data the user wants: ${input}`,
      schema: z.object({
        query: z.string(),
      }),
    });
    return result.object.query;
  } catch (e) {
    console.error("Error generating query: ", e);
  }
};

export const runGeneratedSQLQuery = async (query: string) => {
  if (
    !query.trim().toLowerCase().startsWith("select") ||
    query.trim().toLowerCase().includes("drop") ||
    query.trim().toLowerCase().includes("delete") ||
    query.trim().toLowerCase().includes("insert") ||
    query.trim().toLowerCase().includes("update") ||
    query.trim().toLowerCase().includes("alter") ||
    query.trim().toLowerCase().includes("truncate") ||
    query.trim().toLowerCase().includes("create") ||
    query.trim().toLowerCase().includes("grant") ||
    query.trim().toLowerCase().includes("revoke")
  ) {
    return "Invalid request";
  }

  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

  await client.connect();

  let data: any;

  try {
    data = await client.query(query);
  } catch (e) {
    console.error("Error executing query:", e);
  }

  await client.end();

  return data.rows;
}
import { Client } from 'pg';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from '@canny_ecosystem/utils';
import { BASIC_SYSTEM_PROMPT, GEMINI_MAIN } from './constant';

export const generateQuery = async ({ input, companyId, tablesData, systemPrompt }: { input: string, companyId: string, tablesData: string, systemPrompt: string }) => {
  try {
    const result = await generateObject({
      model: google(GEMINI_MAIN),
      system: `You're a PostgreSQL Query Generator

      Company Id: ${companyId}
      Tables Data as Sample: ${tablesData}

      You are a PostgreSQL query generator for employee data analysis. Generate only SELECT statements

      ${BASIC_SYSTEM_PROMPT}, ${systemPrompt}

      Generate the SQL query based on the natural language request and provided sample data structure
`,
      prompt: input,
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

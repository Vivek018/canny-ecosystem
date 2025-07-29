import { google } from "@ai-sdk/google";
import { z } from "@canny_ecosystem/utils";
import { generateObject } from "ai";
import { GEMINI_MAIN } from "./constant";

export const configSchema = z
  .object({
    title: z.string().describe("Title of the chart"),
    description: z
      .string()
      .describe(
        "What is this chart showing? Explain the value of this visualization. Give proper meaningful description of 40 - 60 words.",
      ),
    takeaway: z
      .string()
      .describe(
        "What is the most interesting insight or summary from the data? Give proper meaningful takeaway of 40 - 60 words.",
      ),
    type: z.enum(["bar", "line", "area", "pie"]).describe("Type of chart"),
    xKey: z
      .string()
      .describe("Field to group by for X-axis. Must be a category or date."),
    yKeys: z
      .array(z.string())
      .describe("Numeric or countable fields used for Y-axis"),
    multipleLines: z
      .boolean()
      .describe("If line chart, is it comparing categories?")
      .optional(),
    measurementColumn: z
      .string()
      .describe("For line charts: y-axis metric like amount or count")
      .optional(),
    lineCategories: z
      .array(z.string())
      .describe("Categories for separate lines in line chart")
      .optional(),
    colors: z
      .record(z.string(), z.string())
      .describe("Color mapping for yKeys")
      .optional(),
    legend: z.boolean().describe("Whether to show a legend"),
  })
  .describe("Chart configuration object");

export const generateChartConfig = async (
  results: any[],
  userQuery: string,
) => {
  "use server";

  try {
    const { object: config } = await generateObject({
      model: google(GEMINI_MAIN),
      system: `You are a data visualization expert.

Your task is to generate a valid React chart configuration using SQL data and a user query. The data is already cleaned—no further transformation or filtering is needed.

== DATA RULES ==
1. Always group the data meaningfully by a categorical or date-based field for the X-axis.
  - Examples: site, status, type, department, position, employee_name, or a formatted date.
  - Do NOT use rows as-is for X values. Group them and aggregate Y values.
2. Y-axis MUST show quantitative insight.
  - If no numerical fields exist, count how many rows exist for each X group (Y = count).
  - If multiple Y values exist (amounts, totals, etc.), include them all.
  - Never return charts with empty or ungrouped Y data.

== OUTPUT RULES ==
1. Use only fields present in the given dataset.
2. Never guess field meanings. Use schema logic only when obvious.
3. Always produce the following chart config:

{
  type: string,                     // "bar", "line", "pie", etc.
  title: string,                   // title based on user query
  xKey: string,                    // grouped dimension
  yKeys: string[],                 // aggregated numeric/count fields
  colors: Record<string, string>, // optional - yKey => color
  legend: boolean,                // true if multiple Y series
  description: string,            // what the chart shows
  takeaway: string                // key insight about the data
}

If the query is unclear, choose the most reasonable insight and grouping for the given data.`,
      prompt: `You are given cleaned SQL data and a user query. 
Generate the best chart configuration for visualizing this data based on the rules provided.

User Query:
${userQuery}

SQL Result:
${JSON.stringify(results, null, 2)}

Return a single valid chart config object only.`,
      schema: configSchema,
      temperature: 0.1,
    });
    const colors: Record<string, string> = {};
    config.yKeys.forEach((key: string, index: number) => {
      colors[key] = `hsl(var(--chart-${index + 1}))`;
    });

    return { config: { ...config, colors } };
  } catch (e) {
    console.error(e);
    return { config: null };
  }
};

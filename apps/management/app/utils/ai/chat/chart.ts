/* ...rest of the file... */

import { google } from "@ai-sdk/google";
import { z } from "@canny_ecosystem/utils";
import { generateObject } from "ai";

export const configSchema = z
  .object({
    description: z
      .string()
      .describe(
        'Describe the chart. What is it showing? What is interesting about the way the data is displayed?',
      ),
    takeaway: z.string().describe('What is the main takeaway from the chart? Give them something usual regarding the data which is meaningfull for them.'),
    type: z.enum(['bar', 'line', 'area', 'pie']).describe('Type of chart'),
    title: z.string(),
    xKey: z.string().describe('Key for x-axis or category it should mostly be a field you can use to group data'),
    yKeys: z
      .array(z.string())
      .describe(
        'Key(s) for y-axis values it should mostly be Quantitative fields (e.g., amount, value)',
      ),
    multipleLines: z
      .boolean()
      .describe(
        'For line charts only: whether the chart is comparing groups of data.',
      )
      .optional(),
    measurementColumn: z
      .string()
      .describe(
        'For line charts only: key for quantitative y-axis column to measure against (eg. values, counts etc.)',
      )
      .optional(),
    lineCategories: z
      .array(z.string())
      .describe(
        'For line charts only: Categories used to compare different lines or data series. Each category represents a distinct line in the chart.',
      )
      .optional(),
    colors: z
      .record(
        z.string().describe('Any of the yKeys'),
        z.string().describe('Color value in CSS format (e.g., hex, rgb, hsl)'),
      )
      .describe('Mapping of data keys to color values for chart elements')
      .optional(),
    legend: z.boolean().describe('Whether to show legend'),
  })
  .describe('Chart configuration object');


export const generateChartConfig = async (
  results: any[],
  userQuery: string,
) => {
  'use server';

  try {
    const { object: config } = await generateObject({
      model: google('gemini-2.0-flash'),
      system: `You are a data visualization expert.

Your job is to generate the best chart configuration based on structured SQL result data and the user's query. The data is already clean — no further filtering is needed.

== GOAL ==
Output a React-ready chart config object that:
- Clearly answers the user query.
- Groups data meaningfully (e.g., by project_site, status, type, position, date).
- Uses readable formatting (e.g., format dates as "dd-MM-yyyy").

== RULES ==
1. Choose appropriate chart type:  
  - **Bar/Line** for trends or categories.  
  - **Pie/Doughnut** for proportions.  
  - **Table** for detailed data.

2. X-axis should be categorical or time-based. Y-axis should be numeric.  
  - If no numeric Y exists, count items per group.  
  - Avoid raw IDs or technical fields on axes.
  - DO not give same x axis and y axis values more than once. Group the ones who same ones and create data like that accordingly.

3. Don’t guess fields. Only use what's present in the data and relevant to the query.

== OUTPUT STRUCTURE ==
{
  type: string,                    // "bar", "line", "pie", etc.
  xKey: string,                    // grouping field
  yKeys: string[],                 // numeric or countable fields
  colors: Record<string, string>, // yKey => color
  legend: boolean
}
`,
      prompt: `Based on the following SQL result and the user's query, generate the most suitable chart config.
  
  User Query:
  ${userQuery}
  
  Data:
  ${JSON.stringify(results, null, 2)}`,
      schema: configSchema,
    });

    // Apply your custom shadcn color theme
    const colors: Record<string, string> = {};
    config.yKeys.forEach((key: string, index: number) => {
      colors[key] = `hsl(var(--chart-${index + 1}))`;
    });

    const updatedConfig = { ...config, colors };
    return { config: updatedConfig };
  } catch (e) {
    console.error(e);
    throw new Error('Failed to generate chart suggestion');
  }
};

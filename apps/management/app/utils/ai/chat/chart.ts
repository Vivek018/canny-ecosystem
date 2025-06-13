/* ...rest of the file... */

import { google } from "@ai-sdk/google";
import { z } from "@canny_ecosystem/utils";
import { generateObject } from "ai";

export const configSchema = z
  .object({
    description: z
      .string()
      .describe(
        'Describe the chart. What is it showing? What is interesting about the way the data is displayed? Give comprehensive details of 50 - 80 words.',
      ),
    takeaway: z.string().describe('What is the main takeaway from the chart? Give comprehensive details of 50 - 80 words.'),
    type: z.enum(['bar', 'line', 'area', 'pie']).describe('Type of chart'),
    title: z.string(),
    xKey: z.string().describe('Key for x-axis or category'),
    yKeys: z
      .array(z.string())
      .describe(
        'Key(s) for y-axis values this is typically the quantitative column',
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
      model: google('gemini-2.0-flash-lite'),
      system: `You are a data visualization and charting expert.
  Your job is to take structured SQL data and generate the best chart configuration for visual representation.
  The data has already been processed and is clean — no further data transformations or filtering are needed.
  
  Guidelines:
  1. Generate a chart config based on the structure and meaning of the data.
  2. Your config must clearly map x and y axes:
    - xKey should represent a meaningful dimension (e.g., name, month, date, status).
    - yKeys should include one or more numeric or count-based fields.
  3. Choose chart types that best match the shape of the data:
    - Use "bar" or "line" for time-series or grouped values.
    - Use "pie" or "doughnut" when comparing parts of a whole.
    - Use "table" when the data is dense and doesn't suit charting well.
  4. Avoid guessing — rely only on the provided data and user query.
  5. The output config must be immediately usable as a React chart config with the following structure:
    {
      type: string,
      xKey: string,
      yKeys: string[],
      colors: Record<string, string>,
      legend: boolean
    }`,
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
  
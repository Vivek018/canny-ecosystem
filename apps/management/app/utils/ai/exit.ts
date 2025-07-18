import { booleanArray, exitReasonArray, z } from "@canny_ecosystem/utils";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { GEMINI_LITE } from "./chat/constant";

export const ExitFiltersSchema = z.object({
  name: z
    .string()
    .optional()
    .describe(
      "Full name, employee code or any identifier. Example: John Doe or EMP123"
    ),
  last_working_day_start: z
    .string()
    .optional()
    .describe(
      "Last working day start range in YYYY-MM-DD format. Example: 1990-01-01"
    ),
  last_working_day_end: z
    .string()
    .optional()
    .describe(
      "Last Working day end range in YYYY-MM-DD format. Example: 2000-12-31"
    ),
  reason: z.enum(exitReasonArray).optional().describe("Reason of leaving."),
  in_invoice: z.enum(booleanArray).optional().describe("Is in any Invoice."),
  project: z
    .string()
    .optional()
    .describe("Project name assigned to the individual."),
  project_site: z
    .string()
    .optional()
    .describe("Name of the site under the project."),
  final_settlement_date_start: z
    .string()
    .optional()
    .describe(
      "Start of Final settlement date range in YYYY-MM-DD. Example: 2020-01-01"
    ),
  final_settlement_date_end: z
    .string()
    .optional()
    .describe(
      "End of Final settlement  range in YYYY-MM-DD. Example: 2023-12-31"
    ),
});

export const generateExitFilter = async ({
  input,
  context,
}: {
  input: string;
  context?: string;
}) => {
  try {
    const result = await generateObject({
      model: google(GEMINI_LITE),
      system: `You are a helpful assistant that generates filters for a given prompt.
      Current date is: ${new Date().toISOString().split("T")[0]}.
      Instructions:
      - Only include filters that have valid and meaningful values.
      - Omit any filters with empty strings, "unknown", null, undefined, or placeholder/default values.
      - Trim whitespace from string values before checking validity.
      - Do not include optional or default filters unless explicitly set.
      - Return filters as clean, minimal objects with only valid entries relevant to the user's request.
      ${context}`,
      prompt: input,
      schema: ExitFiltersSchema,
    });
    return { object: result.object };
  } catch (e) {
    console.error("Error generating query: ", e);
    return {
      object: "Invalid request",
    };
  }
};

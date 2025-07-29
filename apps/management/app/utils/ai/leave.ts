import {
  defaultYear,
  getYears,
  leaveTypeArray,
  z,
} from "@canny_ecosystem/utils";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { GEMINI_LITE } from "./chat/constant";

export const LeavesFiltersSchema = z.object({
  name: z
    .string()
    .optional()
    .describe(
      "Full name, employee code or any identifier. Example: John Doe or EMP123",
    ),
  date_start: z
    .string()
    .optional()
    .describe(
      "Date of Leave start range in YYYY-MM-DD format. Example: 1990-01-01",
    ),
  date_end: z
    .string()
    .optional()
    .describe(
      "Date of Leave end range in YYYY-MM-DD format. Example: 2000-12-31",
    ),
  users: z.string().optional().describe("Authority giving the approval."),
  leave_type: z
    .enum(leaveTypeArray)
    .optional()
    .describe("Types of leave taken."),
  year: z
    .enum(getYears(25, defaultYear).map(String) as [string, ...string[]])
    .optional()
    .describe("Years."),
  project: z
    .string()
    .optional()
    .describe("Project name assigned to the individual."),
  site: z.string().optional().describe("Name of the site under the project."),
});

export const generateLeavesFilter = async ({
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
      schema: LeavesFiltersSchema,
    });
    return { object: result.object };
  } catch (e) {
    console.error("Error generating query: ", e);
    return {
      object: "Invalid request",
    };
  }
};

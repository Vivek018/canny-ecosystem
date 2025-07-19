import { z } from "@canny_ecosystem/utils";
import { generateObject } from "ai";
import {
  assignmentTypeArray,
  educationArray,
  genderArray,
  positionArray,
  skillLevelArray,
  statusArray,
} from "@canny_ecosystem/utils";
import { google } from "@ai-sdk/google";
import { GEMINI_LITE } from "./chat/constant";

export const EmployeeFiltersSchema = z.object({
  name: z
    .string().optional()
    .describe("Full name, employee code or any identifier. Example: John Doe or EMP123"),
  dob_start: z
    .string().optional()
    .describe("Date of birth start range in YYYY-MM-DD format. Example: 1990-01-01"),
  dob_end: z
    .string().optional()
    .describe("Date of birth end range in YYYY-MM-DD format. Example: 2000-12-31"),
  gender: z.enum(genderArray).optional()
    .describe("Gender of the individual."),
  education: z.enum(educationArray).optional()
    .describe("Highest level of education."),
  status: z.enum(statusArray).optional()
    .describe("Current employment status."),
  project: z
    .string().optional()
    .describe("Project name assigned to the individual."),
  site: z
    .string().optional()
    .describe("Name of the site under the project."),
  assignment_type: z.enum(assignmentTypeArray).optional()
    .describe("Type of assignment."),
  position: z.enum(positionArray).optional()
    .describe("Job position or title."),
  skill_level: z.enum(skillLevelArray).optional()
    .describe("Seniority or skill level."),
  doj_start: z
    .string().optional()
    .describe("Start of Date of Joining range in YYYY-MM-DD. Example: 2020-01-01"),
  doj_end: z
    .string().optional()
    .describe("End of Date of Joining range in YYYY-MM-DD. Example: 2023-12-31"),
  dol_start: z
    .string().optional()
    .describe("Start of Date of Leaving range in YYYY-MM-DD. Example: 2022-01-01"),
  dol_end: z
    .string().optional()
    .describe("End of Date of Leaving range in YYYY-MM-DD. Example: 2024-11-30"),
});

export const generateEmployeeFilter = async (
  { input, context }: { input: string, context?: string }
) => {
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
      schema: EmployeeFiltersSchema,
    });
    return { object: result.object };
  } catch (e) {
    console.error("Error generating query: ", e);
    return {
      object: "Invalid request",
    }
  }
};
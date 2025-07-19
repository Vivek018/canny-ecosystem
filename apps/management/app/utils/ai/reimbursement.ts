import {
  booleanArray,
  reimbursementStatusArray,
  reimbursementTypeArray,
  z,
} from "@canny_ecosystem/utils";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { GEMINI_LITE } from "./chat/constant";

export const ReimbursementFiltersSchema = z.object({
  name: z
    .string()
    .optional()
    .describe(
      "Full name, employee code or reimbursement name. Example: John Doe or EMP123 or Bonus"
    ),
  submitted_date_start: z
    .string()
    .optional()
    .describe(
      "Submitted Date Reimbursement start range in YYYY-MM-DD format. Example: 1990-01-01"
    ),
  submitted_date_end: z
    .string()
    .optional()
    .describe(
      "Submitted Date of Reimbursement end range in YYYY-MM-DD format. Example: 2000-12-31"
    ),
  users: z.string().optional().describe("Authority giving the approval."),
  status: z
    .enum(reimbursementStatusArray)
    .optional()
    .describe("Reimbursement status."),
  type: z
    .enum(reimbursementTypeArray)
    .optional()
    .describe("Reimbursement type."),
  project: z
    .string()
    .optional()
    .describe("Project name assigned to the individual."),
  site: z
    .string()
    .optional()
    .describe("Name of the site under the project."),
  in_invoice: z
    .enum(booleanArray)
    .optional()
    .describe("Is the reimbursement in any Invoice."),
});

export const generateReimbursementFilter = async ({
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
      schema: ReimbursementFiltersSchema,
    });
    return { object: result.object };
  } catch (e) {
    console.error("Error generating query: ", e);
    return {
      object: "Invalid request",
    };
  }
};

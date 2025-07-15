import {
  booleanArray,
  payrollTypesArray,
  z,
} from "@canny_ecosystem/utils";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { GEMINI_LITE } from "./chat/constant";

export const InvoiceFiltersSchema = z.object({
  name: z
    .string()
    .optional()
    .describe(
      "Full name, employee code or any identifier. Example: John Doe or EMP123"
    ),
  date_start: z
    .string()
    .optional()
    .describe(
      "Date of Invoice start range in YYYY-MM-DD format. Example: 1990-01-01"
    ),
  date_end: z
    .string()
    .optional()
    .describe(
      "Date of Invoice end range in YYYY-MM-DD format. Example: 2000-12-31"
    ),
  paid_date_start: z
    .string()
    .optional()
    .describe(
      "Date of Invoice paid start range in YYYY-MM-DD format. Example: 1990-01-01"
    ),
  paid_date_end: z
    .string()
    .optional()
    .describe(
      "Date of Invoice Paid end range in YYYY-MM-DD format. Example: 2000-12-31"
    ),
  paid: z.enum(booleanArray).optional().describe("Is the invoice Paid."),
  service_charge: z
    .enum(booleanArray)
    .optional()
    .describe("Is the service charge included in invoice."),
  type: z
    .enum([...payrollTypesArray, "reimbursement", "exit"])
    .optional()
    .describe("Types of payroll."),
  company_location: z
    .string()
    .optional()
    .describe("Location name of which Invoice is created."),
});

export const generateInvoiceFilter = async ({
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
      schema: InvoiceFiltersSchema,
    });
    return { object: result.object };
  } catch (e) {
    console.error("Error generating query: ", e);
    return {
      object: "Invalid request",
    };
  }
};

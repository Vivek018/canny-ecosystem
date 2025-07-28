import {
  defaultYear,
  getYears,
  payrollPaymentStatusArray,
  z,
} from "@canny_ecosystem/utils";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { GEMINI_LITE } from "./chat/constant";
import { months } from "@canny_ecosystem/utils/constant";

export const PayrollFiltersSchema = z.object({
  name: z
    .string()
    .optional()
    .describe(
      "Title of the payroll which will usually be combination of name of company, project, site, month and year. Example: 'COTECNA CG ODISHA MINERAL MARCH 2025'. ",
    ),
  date_start: z
    .string()
    .optional()
    .describe(
      "Date of Payroll start range in YYYY-MM-DD format. Example: 1990-01-01",
    ),
  date_end: z
    .string()
    .optional()
    .describe(
      "Date of Payroll end range in YYYY-MM-DD format. Example: 2000-12-31",
    ),
  status: z
    .enum(payrollPaymentStatusArray)
    .optional()
    .describe("Status of payroll."),
  month: z
    .enum(Object.keys(months) as [string, ...string[]])
    .optional()
    .describe("Months in a year."),
  year: z
    .enum(getYears(25, defaultYear).map(String) as [string, ...string[]])
    .optional()
    .describe("Years."),
});

export const generatePayrollFilter = async ({
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
      schema: PayrollFiltersSchema,
    });
    return { object: result.object };
  } catch (e) {
    console.error("Error generating query: ", e);
    return {
      object: "Invalid request",
    };
  }
};

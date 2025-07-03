import {
  payrollPaymentStatusArray,
  payrollTypesArray,
  z,
} from "@canny_ecosystem/utils";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { GEMINI_LITE } from "./chat/constant";

export const PayrollFiltersSchema = z.object({
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
      "Date of Payroll start range in YYYY-MM-DD format. Example: 1990-01-01"
    ),
  date_end: z
    .string()
    .optional()
    .describe(
      "Date of Payroll end range in YYYY-MM-DD format. Example: 2000-12-31"
    ),
  payroll_type: z
    .enum([...payrollTypesArray, "salary"])
    .optional()
    .describe("Types of payroll."),
  status: z
    .enum(payrollPaymentStatusArray)
    .optional()
    .describe("Status of payroll."),
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

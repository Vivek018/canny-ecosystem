import { generateObject } from "ai";
import { GEMINI_LITE } from "./chat/constant";
import { google } from "@ai-sdk/google";
import { defaultYear, getYears, z } from "@canny_ecosystem/utils";
import { months } from "@canny_ecosystem/utils/constant";
import { recentlyAddedFilter } from "@/constant";

export const VehicleUsageFiltersSchema = z.object({
  name: z
    .string()
    .optional()
    .describe(
      "Registration number of the vehicle. Example: MH02AB1234 or GJ02AB1234"
    ),
  month: z
    .enum(Object.keys(months) as [string, ...string[]])
    .optional()
    .describe("Months in a year."),
  year: z
    .enum(getYears(25, defaultYear).map(String) as [string, ...string[]])
    .optional()
    .describe("Years."),
  vehicle_no: z
    .string()
    .optional()
    .describe(
      "Registration number of the vehicle. Example: MH02AB1234 or GJ02AB1234"
    ),
  recently_added: z
    .enum(recentlyAddedFilter as [string, ...string[]])
    .optional()
    .describe("Vehicle usage added before particular time i.e.Recently added vehicle usages. Example: 5_mins or 8_hours"),
  site: z
    .string()
    .optional()
    .describe("Name of the site under the to which vehicle is linked."),
});

export const generateVehicleUsageFilter = async ({
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
      schema: VehicleUsageFiltersSchema,
    });
    return { object: result.object };
  } catch (e) {
    console.error("Error generating query: ", e);
    return {
      object: "Invalid request",
    };
  }
};

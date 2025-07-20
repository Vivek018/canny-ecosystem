import { MID_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";

export const BASIC_SYSTEM_PROMPT = `REQUIREMENTS:
• Output: SELECT only
• Filter: Always company_id
• Limit: Add LIMIT ${MID_QUERY_LIMIT}
• Security: No INSERT/UPDATE/DELETE/DDL

STRICT CONSTRAINTS:
• Use direct simple comparisons for filtering in sql that can be understood by pg library.
• Employee names: first_name || ' ' || last_name AS full_name
• Date priority: day/month/year → date → created_at
• Rich results: Always Include names, amounts, status (not just Id s)
• Sort: quantitative first, then alphabetical
• Use LEFT JOINs for data
Never include meta fields: created_at, updated_at.

COMPANY FILTERING:
• Use company_id directly if available
• Follow foreign keys to filter by company
`

export const GEMINI_MAIN = "gemini-2.0-flash";
export const GEMINI_LITE = "gemini-2.0-flash-lite";
import { getFirstCompanyQuery } from "@canny_ecosystem/supabase/queries";
import type { TypedSupabaseClient } from "@canny_ecosystem/supabase/types";
import { SECONDS_IN_A_MONTH } from "@canny_ecosystem/utils/constant";
import * as cookie from "cookie";
const cookieName = "company_id";

export async function getCompanyIdOrFirstCompany(
  request: Request,
  supabase: TypedSupabaseClient,
): Promise<string> {
  const cookieHeader = request.headers.get("Cookie");
  const parsed = cookieHeader ? cookie.parse(cookieHeader)[cookieName] : null;
  if (parsed) return parsed;
  return (await getFirstCompanyQuery({ supabase })).data.id;
}

export function setCompanyId(companyId: string | undefined = undefined) {
  if (!companyId) {
    return undefined;
  }
  return cookie.serialize(cookieName, companyId, {
    path: "/",
    maxAge: SECONDS_IN_A_MONTH,
  });
}

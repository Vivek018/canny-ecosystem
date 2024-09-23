import { getFirstCompanyQuery } from "@canny_ecosystem/supabase/queries";
import type { TypedSupabaseClient } from "@canny_ecosystem/supabase/types";
import { SECONDS_IN_A_MONTH } from "@canny_ecosystem/utils/constant";
import * as cookie from "cookie";

const cookieName = "company_id";

export async function getCompanyIdOrFirstCompany(
  request: Request,
  supabase: TypedSupabaseClient,
): Promise<{ companyId: string; setCookie: boolean }> {
  const cookieHeader = request.headers.get("Cookie");
  const parsed = cookieHeader ? cookie.parse(cookieHeader)[cookieName] : null;
  if (parsed?.length) {
    return { companyId: parsed, setCookie: false };
  }
  const companyId = (await getFirstCompanyQuery({ supabase })).data?.id;
  if (companyId) {
    return { companyId: companyId, setCookie: true };
  }
  return { companyId: "", setCookie: false };
}

export function setCompanyId(
  companyId: string | undefined = undefined,
  deleteCompanyId = false,
) {
  if (!companyId || deleteCompanyId) {
    return cookie.serialize(cookieName, "", {
      path: "/",
      expires: new Date(0),
    });
  }
  return cookie.serialize(cookieName, companyId, {
    path: "/",
    maxAge: SECONDS_IN_A_MONTH,
  });
}

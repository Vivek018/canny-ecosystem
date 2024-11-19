import { DEFAULT_ROUTE } from "@/constant";
import { setCompanyId } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { deleteCompany } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const companyId = params.companyId;

  const { status, error } = await deleteCompany({
    supabase,
    id: companyId ?? "",
  });

  if (isGoodStatus(status)) {
    setCompanyId(undefined, true);
    headers.append("Set-Cookie", "company_id=; Path=/; Max-Age=0");
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  return json({ error: error?.toString() }, { status: 500 });
}

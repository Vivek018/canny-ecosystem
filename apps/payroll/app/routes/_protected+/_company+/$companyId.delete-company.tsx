import { DEFAULT_ROUTE } from "@/constant";
import { setCompanyId } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteCompany } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.company}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

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

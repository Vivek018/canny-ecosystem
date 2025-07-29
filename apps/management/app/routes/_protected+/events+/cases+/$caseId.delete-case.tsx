import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteCaseDocument } from "@canny_ecosystem/supabase/media";
import { deleteCasesById } from "@canny_ecosystem/supabase/mutations";
import { getCasesById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  params,
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.cases}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const caseId = params.caseId;
  try {
    const formData = await request.formData();
    const returnTo = formData.get("returnTo") as string;
    let caseData = null;
    if (caseId) {
      ({ data: caseData } = await getCasesById({
        supabase,
        caseId,
      }));
    }
    await deleteCaseDocument({
      supabase,
      companyId,
      caseTitle: caseData?.title!,
    });
    const { error, status } = await deleteCasesById({
      supabase,
      id: caseId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Case deleted successfully",
        returnTo,
        error,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete case",
        returnTo,
        error,
      },
      { status: 500 }
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      returnTo: "",
      error,
    });
  }
}

export default function DeleteCase() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.case);
        toast({
          title: "Success",
          description: actionData?.message || "Case deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ??
            actionData?.message ??
            "Case delete failed",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? "/events/cases");
    }
  }, [actionData]);

  return null;
}

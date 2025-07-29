import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteReimbursementById } from "@canny_ecosystem/supabase/mutations";
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

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.reimbursements}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  const reimbursementId = params.reimbursementId;
  try {
    const formData = await request.formData();
    const employeeId = formData.get("employeeId");
    const returnTo = formData.get("returnTo") as string;
    const { error, status } = await deleteReimbursementById({
      supabase,
      id: reimbursementId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Reimbursement deleted successfully",
        employeeId,
        returnTo,
        error,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete Reimbursement",
        employeeId,
        returnTo,
        error,
      },
      { status: 500 },
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      employeeId: "",
      returnTo: "",
      error,
    });
  }
}

export default function DeleteEmployee() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(
          `${cacheKeyPrefix.employee_reimbursements}${actionData.employeeId}`,
        );
        clearCacheEntry(cacheKeyPrefix.reimbursements);
        toast({
          title: "Success",
          description: actionData?.message || "Reimbursement deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ??
            actionData?.error ??
            actionData?.message ??
            "Reimbursement delete failed",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? "/approvals/reimbursements");
    }
  }, [actionData]);

  return null;
}

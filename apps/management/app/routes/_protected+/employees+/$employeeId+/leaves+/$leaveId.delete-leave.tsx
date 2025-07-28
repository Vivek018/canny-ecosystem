import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteLeaveById } from "@canny_ecosystem/supabase/mutations";
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

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.employeeLeaves}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  const leavesId = params.leaveId;
  try {
    const formData = await request.formData();
    const employeeId = formData.get("employeeId");

    const returnTo = formData.get("returnTo") as string;
    const { error, status } = await deleteLeaveById({
      supabase,
      id: leavesId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Leave deleted successfully",
        employeeId,
        returnTo,
        error,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete Leave",
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
          `${cacheKeyPrefix.employee_leaves}${actionData.employeeId}`,
        );
        clearCacheEntry(cacheKeyPrefix.leaves);
        toast({
          title: "Success",
          description: actionData?.message || "Leave deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error ?? actionData?.message ?? "Leave delete failed",
          variant: "destructive",
        });
      }

      navigate(actionData?.returnTo);
    }
  }, [actionData]);

  return null;
}

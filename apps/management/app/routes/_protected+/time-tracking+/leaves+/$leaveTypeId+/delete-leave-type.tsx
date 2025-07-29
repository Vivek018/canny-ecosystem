import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteLeaveTypeById } from "@canny_ecosystem/supabase/mutations";
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

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.leaves}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  const leaveId = params.leaveTypeId;

  try {
    const { error, status } = await deleteLeaveTypeById({
      supabase,
      id: leaveId ?? "",
    });
    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Leave Type deleted successfully",
        leaveId,
        error,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete leave type",
        leaveId,
        error,
      },
      { status: 500 }
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      leaveId,
      error,
    });
  }
}

export default function DeleteLeaveType() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.leaves);
        toast({
          title: "Success",
          description: actionData?.message || "Leave Type deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ??
            actionData?.message ??
            "Leave Type delete failed",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/leaves");
    }
  }, [actionData]);

  return null;
}

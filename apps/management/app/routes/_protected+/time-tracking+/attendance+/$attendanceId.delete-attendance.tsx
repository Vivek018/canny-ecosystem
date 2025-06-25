import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteAttendanceById } from "@canny_ecosystem/supabase/mutations";
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

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.attendance}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const attendanceId = params.attendanceId;

  try {
    const formData = await request.formData();
    const returnTo = formData.get("returnTo") as string;

    const { error, status } = await deleteAttendanceById({
      supabase,
      id: attendanceId!,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Attendance deleted successfully",
        returnTo,
        error,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete Attendance",
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

export default function DeleteAttendance() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.attendance);
        toast({
          title: "Success",
          description: actionData?.message || "Attendance deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error ??
            actionData?.message ??
            "Attendance delete failed",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? "/time-tracking/attendance");
    }
  }, [actionData]);

  return null;
}

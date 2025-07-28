import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteHolidaysById } from "@canny_ecosystem/supabase/mutations";
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

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.holidays}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  const holidayId = params.holidayId;

  try {
    const { error, status } = await deleteHolidaysById({
      supabase,
      id: holidayId ?? "",
    });
    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Holiday deleted successfully",
        holidayId,
        error,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete holiday",
        holidayId,
        error,
      },
      { status: 500 },
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      holidayId,
      error,
    });
  }
}

export default function DeleteHoliday() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.holidays);
        toast({
          title: "Success",
          description: actionData?.message || "Holiday deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error ?? actionData?.message ?? "Holiday delete failed",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/holidays");
    }
  }, [actionData]);

  return null;
}

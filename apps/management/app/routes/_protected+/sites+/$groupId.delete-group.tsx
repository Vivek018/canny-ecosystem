import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteGroup } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const groupId = params.groupId;

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.groups}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  if (!groupId) {
    return json(
      {
        status: "error",
        message: "Group ID is required",
        error: "No group ID provided",
        redirectUrl: "/",
      },
      { status: 400 }
    );
  }

  try {
    const { error, status } = await deleteGroup({ supabase, id: groupId });

    if (!isGoodStatus(status)) {
      return json(
        {
          status: "error",
          message: "Failed to delete group",
          error,
          redirectUrl: "/",
        },
        { status: 500 }
      );
    }

    return json({
      status: "success",
      message: "Group deleted successfully",
      error: null,
      redirectUrl: "/",
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        redirectUrl: "/",
      },
      { status: 500 }
    );
  }
}

export default function DeleteGroup() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.groups);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error ||
          actionData?.error?.message ||
          "Group deletion failed",
        variant: "destructive",
      });
    }

    navigate(actionData.redirectUrl, { replace: true });
  }, [actionData]);

  return null;
}

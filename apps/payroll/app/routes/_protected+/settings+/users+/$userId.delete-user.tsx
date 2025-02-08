import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { deleteUserById } from "@canny_ecosystem/supabase/mutations";
import { getUserByEmail } from "@canny_ecosystem/supabase/queries";
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
  const userId = params.userId;

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.settingUsers}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  if (!userId || typeof userId !== "string") {
    return json(
      {
        status: "error",
        message: "User ID is required and must be a string",
        error: "Invalid user ID",
        redirectUrl: "/settings/users",
      },
      { status: 400 }
    );
  }

  try {
    // Check if deleting current user
    const { user: sessionUser } = await getSessionUser({ request });
    const { data: dbUser } = await getUserByEmail({
      supabase,
      email: sessionUser?.email ?? "",
    });

    const { error, status } = await deleteUserById({ supabase, id: userId });

    if (!isGoodStatus(status)) {
      return json(
        {
          status: "error",
          message: "Failed to delete user",
          error,
          redirectUrl: "/settings/users",
        },
        { status: 500 }
      );
    }

    // Handle current user deletion
    if (dbUser?.id === userId) {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error("Error logging out:", signOutError);
        return json({
          status: "error",
          message: "Failed to logout after user deletion",
          error: signOutError,
          redirectUrl: "/settings/users",
        });
      }

      return json({
        status: "success",
        message: "Your account has been deleted. You will be logged out.",
        error: null,
        redirectUrl: "/login",
      });
    }

    // Success case for deleting other users
    return json({
      status: "success",
      message: "User deleted successfully",
      error: null,
      redirectUrl: "/settings/users",
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        redirectUrl: "/settings/users",
      },
      { status: 500 }
    );
  }
}

export default function DeleteUser() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearCacheEntry(cacheKeyPrefix.users);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message || "User deletion failed",
        variant: "destructive",
      });
    }

    // Use the redirectUrl from the action response
    navigate(actionData.redirectUrl, { replace: true });
  }, [actionData]);

  return null;
}

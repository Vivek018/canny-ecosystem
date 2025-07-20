import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteDepartment } from "@canny_ecosystem/supabase/mutations";
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
  const departmentId = params.departmentId;

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.departments}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  if (!departmentId) {
    return json(
      {
        status: "error",
        message: "Department ID is required",
        error: "No department ID provided",
        redirectUrl: "/modules/departments",
      },
      { status: 400 }
    );
  }

  try {
    const { error, status } = await deleteDepartment({ supabase, id: departmentId });

    if (!isGoodStatus(status)) {
      return json(
        {
          status: "error",
          message: "Failed to delete department",
          error,
          redirectUrl: "/modules/departments",
        },
        { status: 500 }
      );
    }

    return json({
      status: "success",
      message: "Department deleted successfully",
      error: null,
      redirectUrl: "/modules/departments",
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        redirectUrl: "/modules/departments",
      },
      { status: 500 }
    );
  }
}

export default function DeleteDepartment() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.departments);
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
          "Department deletion failed",
        variant: "destructive",
      });
    }

    navigate(actionData?.redirectUrl ?? "/modules/departments", { replace: true });
  }, [actionData]);

  return null;
}

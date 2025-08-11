import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deletePayeeById } from "@canny_ecosystem/supabase/mutations";
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
  const payeeId = params.payeeId;

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.settingPayee}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  if (!payeeId || typeof payeeId !== "string") {
    return json(
      {
        status: "error",
        message: "Payee ID is required and must be a string",
        error: "Invalid payee ID",
        redirectUrl: "/settings/payee",
      },
      { status: 400 },
    );
  }

  try {
    const { error, status } = await deletePayeeById({ supabase, id: payeeId });

    if (!isGoodStatus(status)) {
      return json(
        {
          status: "error",
          message: "Failed to delete payee",
          error,
          redirectUrl: "/settings/payee",
        },
        { status: 500 },
      );
    }

    return json({
      status: "success",
      message: "Payee deleted successfully",
      error: null,
      redirectUrl: "/settings/payee",
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        redirectUrl: "/settings/payee",
      },
      { status: 500 },
    );
  }
}

export default function DeletePayee() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.payee);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message ||
          actionData?.error ||
          "Payee deletion failed",
        variant: "destructive",
      });
    }

    navigate(actionData.redirectUrl, { replace: true });
  }, [actionData]);

  return null;
}

import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteGratuity } from "@canny_ecosystem/supabase/mutations";
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

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${deleteRole}:${attribute.statutoryFieldsGraduity}`,
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const gratuityId = params.gratuityId;

    const { status, error } = await deleteGratuity({
      supabase,
      id: gratuityId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Gratuity deleted successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to delete gratuity",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 },
    );
  }
}

export default function DeleteGratuity() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.gratuity);
      toast({
        title: "Success",
        description: actionData.message || "Gratuity deleted",
        type: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error ||
          actionData?.error?.message ||
          "Gratuity delete failed",
        type: "error",
      });
    }

    navigate("/payment-components/statutory-fields/gratuity", {
      replace: true,
    });
  }, [actionData]);
  return null;
}

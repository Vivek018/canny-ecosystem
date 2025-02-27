import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deletePaySequenceById } from "@canny_ecosystem/supabase/mutations";

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

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.paySequence}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  const paySequenceId = params.id;

  try {
    const { error, status } = await deletePaySequenceById({
      supabase,
      id: paySequenceId ?? "",
    });
    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Pay Sequence deleted successfully",
        paySequenceId,
        error,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete pay sequence",
        paySequenceId,
        error,
      },
      { status: 500 }
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      paySequenceId,
      error,
    });
  }
}

export default function DeletePaySequence() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.paySequence);
        toast({
          title: "Success",
          description: actionData?.message || "Pay Sequence deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error ??
            actionData?.message ??
            "Pay Sequence delete failed",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/pay-sequence");
    }
  }, [actionData]);

  return null;
}

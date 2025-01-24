import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteStatutoryBonus } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const sbId = params.sbId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      `${user?.role!}`,
      `${deleteRole}:  "statutory_fields_statutory_bonus",
  `
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { status, error } = await deleteStatutoryBonus({
      supabase,
      id: sbId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Statutory Bonus deleted successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to delete Statutory Bonus",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export default function DeleteStatutoryBonus() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      toast({
        title: "Success",
        description: actionData?.message || "Statutory Bonus deleted",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message || "Statutory Bonus delete failed",
        variant: "destructive",
      });
    }

    navigate("/payment-components/statutory-fields/statutory-bonus", {
      replace: true,
    });
  }, [actionData]);

  return null;
}

import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteIncidentById } from "@canny_ecosystem/supabase/mutations";
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

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.incidents}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const incidentId = params.incidentId;
  try {
    const formData = await request.formData();
    const employeeId = formData.get("employeeId");
    const returnTo = formData.get("returnTo") as string;
    const { error, status } = await deleteIncidentById({
      supabase,
      id: incidentId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Incident deleted successfully",
        employeeId,
        returnTo,
        error,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete Incident",
        employeeId,
        returnTo,
        error,
      },
      { status: 500 }
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      employeeId: "",
      returnTo: "",
      error,
    });
  }
}

export default function DeleteIncident() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.incidents);
        toast({
          title: "Success",
          description: actionData?.message || "Incident deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error ??
            actionData?.message ??
            "Incident delete failed",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? "/events/incidents");
    }
  }, [actionData]);

  return null;
}

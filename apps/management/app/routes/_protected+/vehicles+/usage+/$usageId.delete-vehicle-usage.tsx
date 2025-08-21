import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteVehicleUsageById } from "@canny_ecosystem/supabase/mutations";
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

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.vehicle_usage}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  const usageId = params.usageId;

  try {
    const formData = await request.formData();
    const employeeId = formData.get("employeeId");
    const returnTo = formData.get("returnTo") as string;

    const { error, status } = await deleteVehicleUsageById({
      supabase,
      id: usageId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Vehicle Usage deleted successfully",
        employeeId,
        returnTo,
        error,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete Vehicle Usage",
        employeeId,
        returnTo,
        error,
      },
      { status: 500 },
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

export default function DeleteEmployee() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(
          `${cacheKeyPrefix.vehicle_usage}${actionData.employeeId}`,
        );
        clearCacheEntry(cacheKeyPrefix.vehicle_usage);
        toast({
          title: "Success",
          description: actionData?.message || "Vehicle Usage deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ??
            actionData?.error ??
            actionData?.message ??
            "Vehicle Usage delete failed",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? "/vehicles/usage");
    }
  }, [actionData]);

  return null;
}

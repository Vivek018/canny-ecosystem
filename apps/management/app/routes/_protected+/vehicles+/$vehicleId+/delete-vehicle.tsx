import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteVehiclePhoto } from "@canny_ecosystem/supabase/media";
import { deleteVehicle } from "@canny_ecosystem/supabase/mutations";
import { getVehicleById } from "@canny_ecosystem/supabase/queries";
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

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.vehicles}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const vehicleId = params.vehicleId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    let invoiceData = null;

    if (vehicleId) {
      ({ data: invoiceData } = await getVehicleById({
        supabase,
        id: vehicleId,
      }));
    }

    const { error: proofError } = await deleteVehiclePhoto({
      supabase,
      documentName: invoiceData?.registration_number!,
    });

    const { status, error } = await deleteVehicle({
      supabase,
      id: vehicleId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Vehicle deleted",
        error: null,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete vehicle",
        error: proofError || error,
      },
      { status: 500 }
    );
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

export default function DeleteVehicle() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.vehicles);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            (actionData?.error as any)?.message || actionData?.error?.message,
          variant: "destructive",
        });
      }
      navigate("/vehicles", { replace: true });
    }
  }, [actionData]);

  return null;
}

import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteVehicleInsuranceDocument } from "@canny_ecosystem/supabase/media";
import { deleteVehicleInsurance } from "@canny_ecosystem/supabase/mutations";
import { getVehicleInsuranceById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate, useParams } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${deleteRole}:${attribute.vehicle_insurance}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const vehicleId = params.vehicleId;
  const insuranceId = params.insuranceId;

  try {
    let insuranceData = null;

    if (vehicleId) {
      ({ data: insuranceData } = await getVehicleInsuranceById({
        supabase,
        id: insuranceId!,
      }));
    }

    const { error: proofError } = await deleteVehicleInsuranceDocument({
      supabase,
      documentName: insuranceData?.insurance_number!,
    });
    const { status, error } = await deleteVehicleInsurance({
      supabase,
      id: insuranceId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Vehicle Insurance deleted successfully",
        error: null,
        vehicleId,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete Vehicle Insurance",
        error: proofError || error,
        vehicleId,
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        vehicleId,
      },
      { status: 500 }
    );
  }
}

export default function DeleteVehicleInsurance() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { vehicleId } = useParams();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.vehicle_overview}${vehicleId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Vehicle Insurance deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Vehicle Insurance delete failed",
          variant: "destructive",
        });
      }
      navigate(`/vehicles/vehicle/${actionData?.vehicleId}`);
    }
  }, [actionData]);

  return null;
}

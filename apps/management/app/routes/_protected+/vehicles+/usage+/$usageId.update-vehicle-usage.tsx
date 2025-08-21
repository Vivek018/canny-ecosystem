import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  hasPermission,
  isGoodStatus,
  updateRole,
  VehicleUsageSchema,
} from "@canny_ecosystem/utils";
import { updateVehicleUsageById } from "@canny_ecosystem/supabase/mutations";
import {
  getVehiclesByCompanyId,
  getVehicleUsageById,
} from "@canny_ecosystem/supabase/queries";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import AddVehicleUsage from "./create-vehicle-usage";

export const UPDATE_VEHICLE_USAGE_TAG = "Update_Vehicle_Usage";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const usageId = params.usageId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.vehicle_usage}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  let usageData = null;
  let error = null;

  const { data: vehicleData, error: vehicleError } =
    await getVehiclesByCompanyId({
      supabase,
      companyId,
    });
  if (vehicleError || !vehicleData) throw vehicleError;

  if (usageId) {
    const { data, error: usageError } = await getVehicleUsageById({
      supabase,
      usageId,
    });

    usageData = data;
    error = usageError;
  }

  const vehicleOptions = vehicleData.map((userData) => ({
    label: userData.registration_number,
    value: userData.id,
  }));

  return json({ data: usageData, vehicleOptions, usageId, error });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const usageId = params.usageId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: VehicleUsageSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateVehicleUsageById({
    usageId: usageId!,
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Vehicle Usage updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Vehicle Usage update failed",
    error,
  });
}

export default function UpdateVehicleUsage() {
  const { data, vehicleOptions, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const updatableData = data;

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load usage data",
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.vehicle_usage}`);

        toast({
          title: "Success",
          description: actionData?.message || "Usage updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Failed to update usage",
          variant: "destructive",
        });
      }
      navigate("/vehicles/usage");
    }
  }, [actionData]);

  return (
    <AddVehicleUsage
      updateValues={updatableData}
      vehicleOptionsFromUpdate={vehicleOptions}
    />
  );
}

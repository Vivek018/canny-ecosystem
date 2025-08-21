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
  IncidentSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import RegisterIncident from "./$employeeId.create-incident";
import { updateIncidentById } from "@canny_ecosystem/supabase/mutations";
import { getIncidentsById } from "@canny_ecosystem/supabase/queries";
import type { IncidentsDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import RegisterIncidentVehicle from "./$vehicleId.create-incident-vehicle";

export const UPDATE_INCIDENTS_TAG = "Update-Incident";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const incidentId = params.incidentId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.incidents}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  let incidentData = null;
  let error = null;

  if (incidentId) {
    const { data, error: incidentError } = await getIncidentsById({
      supabase,
      incidentId,
    });

    incidentData = data;
    error = incidentError;
  }

  return json({ data: incidentData as IncidentsDatabaseUpdate, error });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const incidentId = params.incidentId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: IncidentSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }
  const data = { ...submission.value, id: submission.value.id ?? incidentId };

  const { status, error } = await updateIncidentById({
    supabase,
    data,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee incident updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Employee incident update failed",
    error,
  });
}

export default function UpdateIncidents() {
  const { data, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const updatableData = data;

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load incident data",
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.incidents);
        toast({
          title: "Success",
          description: actionData?.message || "Incident updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Failed to update incident",
          variant: "destructive",
        });
      }
      navigate("/events/incidents");
    }
  }, [actionData]);

  return updatableData?.vehicle_id ? (
    <RegisterIncidentVehicle updateValues={updatableData} />
  ) : (
    <RegisterIncident updateValues={updatableData} />
  );
}

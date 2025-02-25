import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateLocation from "./create-location";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import {
  hasPermission,
  isGoodStatus,
  LocationSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { getLocationById } from "@canny_ecosystem/supabase/queries";
import { updateLocation } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_LOCATION = "update-location";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const locationId = params.locationId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.settingLocations}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let locationData = null;
    let locationError = null;

    if (locationId) {
      ({ data: locationData, error: locationError } = await getLocationById({
        supabase,
        id: locationId,
      }));

      if (locationError) throw locationError;

      return json({
        locationData,
        error: null,
      });
    }
    throw new Error("No locationId provided");
  } catch (error) {
    return json({
      error,
      locationData: null,
    });
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: LocationSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateLocation({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status))
    return json({
      status: "success",
      message: "Location updated successfully",
      error: null,
    });

  return json(
    {
      status: "error",
      message: "Location update failed",
      error,
    },
    { status: 500 },
  );
}

export default function UpdateLocation() {
  const { locationData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.locations);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message || "Location update failed",
        variant: "destructive",
      });
    }
    navigate("/settings/locations", {
      replace: true,
    });
  }, [actionData]);

  if (error) {
    return <ErrorBoundary error={error} message="Failed to load location" />;
  }

  return <CreateLocation updateValues={locationData} />;
}

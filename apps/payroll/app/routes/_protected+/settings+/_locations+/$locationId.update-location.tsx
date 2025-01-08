import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateLocation from "./create-location";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Await,
  defer,
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { isGoodStatus, LocationSchema } from "@canny_ecosystem/utils";
import { getLocationById } from "@canny_ecosystem/supabase/queries";
import { updateLocation } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";

export const UPDATE_LOCATION = "update-location";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const locationId = params.locationId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    let locationPromise = null;

    if (locationId) {
      locationPromise = getLocationById({
        supabase,
        id: locationId,
      });
    } else {
      throw new Error("No locationId provided");
    }

    return defer({
      locationPromise,
      error: null,
    });
  } catch (error) {
    return json({
      error,
      locationPromise: null,
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
  const { locationPromise, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={locationPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load location" />;
          if (resolvedData.error)
            return <ErrorBoundary error={resolvedData.error} />;
          return <CreateLocation updateValues={resolvedData.data} />;
        }}
      </Await>
    </Suspense>
  );
}

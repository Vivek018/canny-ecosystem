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
import { safeRedirect } from "@/utils/server/http.server";
import { isGoodStatus, LocationSchema } from "@canny_ecosystem/utils";
import { getLocationById } from "@canny_ecosystem/supabase/queries";
import { updateLocation } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";

export const UPDATE_LOCATION = "update-location";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const locationId = params.locationId;
  const { supabase } = getSupabaseWithHeaders({ request });

  let locationData = null;

  if (locationId) {
    locationData = await getLocationById({
      supabase,
      id: locationId,
    });
  }

  if (locationData?.error) {
    throw locationData.error;
  }

  return json({ data: locationData?.data });
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
  const { data } = useLoaderData<typeof loader>();
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
      navigate("/settings/locations", {
        replace: true,
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message || "Location update failed",
        variant: "destructive",
      });
    }
  }, [actionData, toast, navigate]);

  return <CreateLocation updateValues={data} />;
}

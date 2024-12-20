import { deleteLocation } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const locationId = params.locationId;

    const { status, error } = await deleteLocation({
      supabase,
      id: locationId ?? "",
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Location deleted",
        error: null,
      });

    return json(
      { status: "error", message: "Location delete failed", error },
      { status: 500 },
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    });
  }
}

export default function DeleteLocation() {
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
          description: actionData?.error?.message || "Location delete failed",
          variant: "destructive",
        });
      }
    navigate("/settings/locations", { replace: true });
  }, [actionData]);
  
  return null;
}

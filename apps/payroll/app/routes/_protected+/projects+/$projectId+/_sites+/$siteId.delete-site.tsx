import { deleteSite } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({ request, params }: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const siteId = params.siteId;
    const projectId = params.projectId;

    const { status, error } = await deleteSite({
      supabase,
      id: siteId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Site deleted",
        error: null,
        projectId,
      });
    }

    return json({
      status: "error",
      message: "Failed to delete site",
      error,
      projectId,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 },
    );
  }
}

export default function DeleteSite() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error,
          variant: "destructive",
        });
      }

      navigate(`/projects/${actionData?.projectId}/sites`, { replace: true });
    }
  }, [actionData]);
  return null;
}

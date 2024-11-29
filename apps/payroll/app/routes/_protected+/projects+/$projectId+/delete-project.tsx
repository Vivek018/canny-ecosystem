import { safeRedirect } from "@/utils/server/http.server";
import { deleteProject } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const projectId = params.projectId;

  const { status, error } = await deleteProject({
    supabase,
    id: projectId ?? "",
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Project deleted",
      error: null,
    });
  }

  return json(
    { status: "error", message: "Failed to delete project", error },
    { status: 500 },
  );
}

export default function DeleteProject() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData.error,
          variant: "destructive",
        });
      }
      navigate("/projects", { replace: true });
    }
  }, [actionData]);

  return null;
}

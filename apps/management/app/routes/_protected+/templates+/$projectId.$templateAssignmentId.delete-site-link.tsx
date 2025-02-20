import { isGoodStatus } from "@canny_ecosystem/utils";
import { json, useActionData, useNavigate } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { deletePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

type ActionDataType = {
  status: string,
  message: string,
  returnTo: string,
  error: any
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { projectId, templateAssignmentId } = params;

  const { status, error } = await deletePaymentTemplateAssignment({
    supabase,
    id: templateAssignmentId as string,
  });
  
  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Site link deleted successfully",
      returnTo: `/projects/${projectId}/sites`,
      error: null
    });
  }

  return json({
    status: "error",
    message: "Failed to delete site link",
    returnTo: `/projects/${projectId}/sites`,
    error
  });
}

export default function DeleteSiteLink() {
  const actionData = useActionData<ActionDataType>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.sites);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      }
      else {
        toast({
          title: "error",
          description: actionData?.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);
}
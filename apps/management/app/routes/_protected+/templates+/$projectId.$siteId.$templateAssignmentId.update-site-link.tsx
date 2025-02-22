import { isGoodStatus, SiteLinkSchema } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json, useActionData, useNavigate } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { updatePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
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
  const { templateAssignmentId, siteId: site_id, projectId } = params;
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: SiteLinkSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updatePaymentTemplateAssignment({
    supabase,
    data: {
      ...submission.value,
      assignment_type: "site",
      site_id,
    } as any,
    id: templateAssignmentId as string,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Site link updated successfully",
      returnTo: `/projects/${projectId}/${site_id}/link-templates`,
      error: null
    });
  }

  return json({
    status: "error",
    message: "Failed to update site link",
    returnTo: `/projects/${projectId}/${site_id}/link-templates`,
    error
  });
}

export default function UpdateSiteLink() {
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
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { uploadAvatar } from "@canny_ecosystem/supabase/media";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const returnTo = formData.get("returnTo") as string;

  if (!file || !(file instanceof File)) {
    return json({
      status: "error",
      message: "Invalid file object received",
      returnTo,
    });
  }
  const { error } = await uploadAvatar({ supabase, avatar: file });
  if (error) {
    return json({
      status: "error",
      message: error.toString(),
      returnTo,
    });
  }
  return json({
    status: "success",
    message: "Avatar uploaded successfully",
    returnTo,
  });
}

export default function UploadAvatar() {
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
        clearExactCacheEntry(cacheKeyPrefix.users);
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message ?? actionData?.message,
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo);
    }
  }, [actionData]);
}

import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { uploadCompanyLogo } from "@canny_ecosystem/supabase/media";

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
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
  const { error } = await uploadCompanyLogo({
    supabase,
    logo: file,
    companyId,
  });
  if (error) {
    return json({
      status: "error",
      message: error.toString(),
      returnTo,
    });
  }
  return json({
    status: "success",
    message: "Logo uploaded successfully",
    returnTo,
  });
}

export default function UploadLogo() {
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
          description: actionData?.error?.message ?? actionData?.message,
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo);
    }
  }, [actionData]);
}

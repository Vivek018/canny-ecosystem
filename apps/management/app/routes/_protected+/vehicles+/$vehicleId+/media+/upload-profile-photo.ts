import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { uploadVehiclePhoto } from "@canny_ecosystem/supabase/media";
import { getVehicleById } from "@canny_ecosystem/supabase/queries";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const vehicleId = params.vehicleId as string;
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const returnTo = formData.get("returnTo") as string;
  const { data } = await getVehicleById({ id: vehicleId, supabase });
  if (!file || !(file instanceof File)) {
    return json({
      status: "error",
      message: "Invalid file object received",
      returnTo,
    });
  }
  const { error } = await uploadVehiclePhoto({
    supabase,
    vehiclePhoto: file,
    vehicleId,
    documentName: data?.registration_number!,
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
    message: "Profile photo uploaded successfully",
    returnTo,
  });
}

export default function UploadProfilePhoto() {
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

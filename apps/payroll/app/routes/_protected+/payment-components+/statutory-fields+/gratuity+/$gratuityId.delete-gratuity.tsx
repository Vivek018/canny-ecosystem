import { deleteGratuity } from "@canny_ecosystem/supabase/mutations";
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
    const gratuityId = params.gratuityId;

    const { status, error } = await deleteGratuity({
      supabase,
      id: gratuityId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Gratuity deleted successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to delete gratuity",
      error,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    }, { status: 500 });
  }
}

export default function DeleteGratuity() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      toast({
        title: "Success",
        description: actionData.message || "Gratuity deleted",
        type: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message ||
          "Gratuity delete failed",
        type: "error",
      });
    }

    navigate("/payment-components/statutory-fields/gratuity", {
      replace: true,
    });
  }, [actionData]);
  return null;
}

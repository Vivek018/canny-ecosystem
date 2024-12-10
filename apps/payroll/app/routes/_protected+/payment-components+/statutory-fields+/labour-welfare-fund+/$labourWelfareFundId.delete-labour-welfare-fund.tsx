import { deleteLabourWelfareFund } from "@canny_ecosystem/supabase/mutations";
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
    const labourWelfareFundId = params.labourWelfareFundId;

    const { status, error } = await deleteLabourWelfareFund({
      supabase,
      id: labourWelfareFundId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Labour Welfare Fund deleted successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to delete Labour Welfare Fund",
      error,
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

export default function DeleteLabourWelfareFund() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      toast({
        title: "Success",
        description: actionData?.message || "Labour Welfare Fund deleted",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error.message || "Labour Welfare Fund delete failed",
        variant: "destructive",
      });
    }
    navigate("/payment-components/statutory-fields/labour-welfare-fund", {
      replace: true,
    });
  }, [actionData]);

  return null;
}

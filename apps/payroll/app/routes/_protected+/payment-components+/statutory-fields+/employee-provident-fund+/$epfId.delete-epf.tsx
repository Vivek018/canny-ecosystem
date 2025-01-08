import { deleteEmployeeProvidentFund } from "@canny_ecosystem/supabase/mutations";
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
  const epfId = params.epfId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { status, error } = await deleteEmployeeProvidentFund({
      supabase,
      id: epfId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "EPF deleted successfully",
        error: null,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete EPF",
        error,
      },
      { status: 500 },
    );
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

export default function DeleteEmployeeProvidentFund() {
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
        description: actionData?.error?.message || "EPF delete failed",
        variant: "destructive",
      });
    }

    navigate("/payment-components/statutory-fields/employee-provident-fund");
  }, [actionData]);
  return null;
}

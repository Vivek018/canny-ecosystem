import { clearCacheEntry } from "@/utils/cache";
import { deleteEmployee } from "@canny_ecosystem/supabase/mutations";
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
  const employeeId = params.employeeId;
  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { status, error } = await deleteEmployee({
      supabase,
      id: employeeId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee deleted successfully",
        error: null,
      });
    }

    return json(
      { status: "error", message: "Failed to delete employee", error },
      { status: 500 }
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    });
  }
}

export default function DeleteEmployee() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry("/employees");
        toast({
          title: "Success",
          description: actionData?.message || "Employee deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Employee delete failed",
          variant: "destructive",
        });
      }
      navigate("/employees");
    }
  }, [actionData]);

  return null;
}

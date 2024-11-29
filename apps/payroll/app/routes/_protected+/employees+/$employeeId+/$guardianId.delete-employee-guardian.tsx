import { deleteEmployeeGuardian } from "@canny_ecosystem/supabase/mutations";
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
  const { supabase } = getSupabaseWithHeaders({ request });
  const guardianId = params.guardianId;

  const { status, error } = await deleteEmployeeGuardian({
    supabase,
    id: guardianId ?? "",
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee guardian deleted successfully",
      error: null,
    });
  }

  return json(
    { status: "error", message: "Failed to delete employee guardian", error },
    { status: 500 },
  );
}

export default function DeleteEmployeeGuardian() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Guardian deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Guardian delete failed",
          variant: "destructive",
        });
      }
      navigate(-1);
    }
  }, [actionData]);

  return null;
}

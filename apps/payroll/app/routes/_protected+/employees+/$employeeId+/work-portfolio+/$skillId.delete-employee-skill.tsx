import { deleteEmployeeSkill } from "@canny_ecosystem/supabase/mutations";
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
  const skillId = params.skillId;
  const employeeId = params.employeeId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { status, error } = await deleteEmployeeSkill({
      supabase,
      id: skillId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee skill deleted successfully",
        error: null,
        employeeId,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete employee skill",
        error,
        employeeId,
      },
      { status: 500 },
    );
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
      employeeId,
    });
  }
}

export default function DeleteEmployeeSkill() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Employee skill deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Employee skill delete failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${actionData?.employeeId}/work-portfolio`);
    }
  }, [actionData]);

  return null;
}

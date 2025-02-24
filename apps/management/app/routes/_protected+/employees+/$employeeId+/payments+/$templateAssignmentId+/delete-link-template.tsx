import { isGoodStatus } from "@canny_ecosystem/utils";
import { json, useActionData, useNavigate, useParams } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { deletePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const employeeId = params.employeeId as string;
  const templateAssignmentId = params.templateAssignmentId;

  const { status, error } = await deletePaymentTemplateAssignment({
    supabase,
    id: templateAssignmentId ?? "",
  });
  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Successfully deleted payment template link.",
      returnTo: `/employees/${employeeId}/payments`,
      error,
    });
  }

  return json({
    status: "error",
    message: "Failed to delete payment template link.",
    returnTo: `/employees/${employeeId}/payments`,
    error,
  });
}

export default function DeleteEmployeeLinkTemplate() {
  const actionData = useActionData<typeof action>();

  const { employeeId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_payments}${employeeId}`
        );
        toast({
          title: "Success",
          description: actionData.message,
          variant: "success",
        });
      } else {
        toast({
          title: "error",
          description: actionData.message,
          variant: "destructive",
        });
      }
      navigate(actionData.returnTo);
    }
  }, [actionData]);
}

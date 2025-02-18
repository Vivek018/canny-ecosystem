import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { updatePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import { getPaymentTemplateAssignmentIdByEmployeeId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { EmployeeLinkSchema } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({ request, params }: ActionFunctionArgs):Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const employeeId = params.employeeId as string;
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: EmployeeLinkSchema });

  if (submission.status !== "success")
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );

  try {
    const {
      data: paymentTemplateAssignmentData,
      error: paymentTemplateAssignmentError,
    } = await getPaymentTemplateAssignmentIdByEmployeeId({
      supabase,
      employeeId,
    });

    if (paymentTemplateAssignmentError) {
      return json({
        status: "error",
        message: "Failed to fetch Payment Template Assignment ID",
      });
    }
    const { error } = await updatePaymentTemplateAssignment({
      supabase,
      data: {
        ...submission.value,
        employee_id: employeeId,
        assignment_type: "employee",
      },
      id: paymentTemplateAssignmentData?.id as string,
    });

    if (error) throw error;
    return json({
      status: "success",
      message: "Successfully updated payment template link",
      returnTo: `/employees/${employeeId}/payments`,
      error: null,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "Failed to update payment template link.",
      returnTo: `/employees/${employeeId}/payments`,
      error,
    });
  }
}

export default function UpdateEmployeeLinkTemplate() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.payments);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "error",
          description: actionData?.message,
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo);
    }
  }, [actionData]);
}

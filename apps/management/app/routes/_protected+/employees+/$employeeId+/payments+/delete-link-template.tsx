import { isGoodStatus, z } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json, useActionData, useNavigate } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { deletePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import { getPaymentTemplateAssignmentIdByEmployeeId } from "@canny_ecosystem/supabase/queries";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

const DeleteEmployeeLinkSchema = z.object({
  is_active: z.enum(["true", "false"]).transform((val) => val === "true"),
});

export async function action({ request, params }: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const employeeId = params.employeeId as string;

  const submission = parseWithZod(formData, { schema: DeleteEmployeeLinkSchema, });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { data } = await getPaymentTemplateAssignmentIdByEmployeeId({
    supabase,
    employeeId,
  });
  const templateId = data?.id ?? "" as string;

  const { status, error } = await deletePaymentTemplateAssignment({
    supabase,
    id: templateId,
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "success") {
        clearCacheEntry(cacheKeyPrefix.payments);
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

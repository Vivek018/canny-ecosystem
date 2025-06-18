import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import {
  updateExitAndPayrollById,
  updateReimbursementsAndPayrollById,
} from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate, useParams } from "@remix-run/react";
import { useEffect } from "react";

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const type = formData.get("type") as string;
    const payrollEntryId = params.payrollEntryId;

    if (type === "reimbursement") {
      const { status, error } = await updateReimbursementsAndPayrollById({
        supabase,
        reimbursementId: payrollEntryId ?? "",
        data: { payroll_id: null },
        action: "delete",
      });

      if (isGoodStatus(status)) {
        return json({
          status: "success",
          message: "Payroll Entry deleted successfully",
          error: null,
        });
      }
      return json(
        { status: "error", message: "Payroll Entry delete failed", error },
        { status: 500 }
      );
    }
    const { status, error } = await updateExitAndPayrollById({
      supabase,
      data: { id: payrollEntryId, payroll_id: null },
      action:"delete"
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Payroll Entry deleted successfully",
        error: null,
      });
    }
    return json(
      { status: "error", message: "Payroll Entry delete failed", error },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        data: null,
      },
      { status: 500 }
    );
  }
}

export default function UpdatePayrollEntry() {
  const actionData = useActionData<typeof action>();
  const { payrollId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
        clearExactCacheEntry(cacheKeyPrefix.run_payroll);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error || actionData?.message,
          variant: "destructive",
        });
      }
      navigate(`/payroll/run-payroll/${payrollId}`, { replace: true });
    }
  }, [actionData]);

  return null;
}

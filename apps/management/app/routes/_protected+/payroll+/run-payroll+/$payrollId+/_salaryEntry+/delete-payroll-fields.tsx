import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clearExactCacheEntry } from "@/utils/cache";
import { deletePayrollFieldById } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate, useParams } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const formData = await request.formData();
    const fieldId = formData.get("fieldId") as string;

    const { error, status } = await deletePayrollFieldById({
      id: fieldId,
      supabase,
    });
    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Field deleted successfully",
        error: null,
      });
    }
    return json({
      status: "error",
      message: "Field deleted failed",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export default function DeleteField() {
  const actionData = useActionData<typeof action>();
  const { payrollId } = useParams();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;

    if (actionData?.status === "success") {
      clearCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
      clearExactCacheEntry(cacheKeyPrefix.run_payroll);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message ||
          actionData?.error ||
          "Field deletion failed",
        variant: "destructive",
      });
    }

    navigate(`/payroll/run-payroll/${payrollId}`, { replace: true });
  }, [actionData]);

  return null;
}

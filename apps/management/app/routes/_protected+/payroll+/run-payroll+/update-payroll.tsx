import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { updatePayrollById } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";

import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const payrollData = JSON.parse(formData.get("payrollData") as string);
    const payrollId = formData.get("payrollId") as string;
    const failedRedirect = formData.get("failedRedirect") as string;
    const { error, status } = await updatePayrollById({
      data: payrollData,
      payrollId,
      supabase,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Payroll updates successfully",
        failedRedirect,
        error: null,
        payrollId,
      });
    }
    return json(
      {
        status: "error",
        message: "Failed to update payroll",
        failedRedirect,
        error,
        payrollId,
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("Update Payroll error", error);
    return json({
      status: "error",
      message: "An unexpected error occurred in update payroll",
      failedRedirect: null,
      error,
    });
  }
}

export default function UpdatePayroll() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.run_payroll_id}${actionData.payrollId}`,
        );
        clearExactCacheEntry(
          `${cacheKeyPrefix.payroll_history_id}${actionData.payrollId}`,
        );

        toast({
          title: "Success",
          description: actionData?.message || "Payroll Updated",
          variant: "success",
        });
        navigate(actionData.failedRedirect);
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            "Payroll Update failed",
          variant: "destructive",
        });
        navigate(actionData?.failedRedirect ?? DEFAULT_ROUTE);
      }
    }
  }, [actionData]);

  return null;
}

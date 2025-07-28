import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deletePayroll } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate, useParams } from "@remix-run/react";
import { useEffect } from "react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.payroll}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const payrollId = params.payrollId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { status, error } = await deletePayroll({
      supabase,
      id: payrollId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Payroll deleted",
        error: null,
      });
    }

    return json(
      { status: "error", message: "Failed to delete payroll", error },
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

export default function DeletePayroll() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { payrollId } = useParams();

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
          description: (actionData?.error as any)?.message,
          variant: "destructive",
        });
      }
      navigate("/payroll/run-payroll", { replace: true });
    }
  }, [actionData]);

  return null;
}

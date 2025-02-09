import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteEmployeeWorkHistory } from "@canny_ecosystem/supabase/mutations";
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

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${deleteRole}:${attribute.employeeWorkHistory}`
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const workHistoryId = params.workHistoryId;
  const employeeId = params.employeeId;

  try {
    const { status, error } = await deleteEmployeeWorkHistory({
      supabase,
      id: workHistoryId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee work history deleted successfully",
        error: null,
        employeeId,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete employee work history",
        error,
        employeeId,
      },
      { status: 500 }
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

export default function DeleteWorkHistory() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { employeeId } = useParams();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`
        );
        toast({
          title: "Success",
          description: actionData?.message || "Employee work history deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Employee work history delete failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${actionData?.employeeId}/work-portfolio`);
    }
  }, [actionData]);

  return null;
}

import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteEmployeeGuardian } from "@canny_ecosystem/supabase/mutations";
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
    !hasPermission(user?.role!, `${deleteRole}:${attribute.employeeGuardians}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const guardianId = params.guardianId;
  const employeeId = params.employeeId;
  try {
    const { status, error } = await deleteEmployeeGuardian({
      supabase,
      id: guardianId ?? "",
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee guardian deleted successfully",
        error: null,
        employeeId,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete employee guardian",
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

export default function DeleteEmployeeGuardian() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { employeeId } = useParams();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_overview}${employeeId}`
        );
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
      navigate(`/employees/${actionData?.employeeId}`);
    }
  }, [actionData]);

  return null;
}

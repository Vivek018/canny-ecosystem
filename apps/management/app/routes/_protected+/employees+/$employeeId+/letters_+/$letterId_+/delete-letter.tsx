import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteEmployeeLetter } from "@canny_ecosystem/supabase/mutations";
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
  const employeeId = params.employeeId;
  const letterId = params.letterId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${deleteRole}:${attribute.employeeLetters}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    const { status, error } = await deleteEmployeeLetter({
      supabase,
      id: letterId ?? "",
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Employee Letter deleted",
        employeeId,
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Employee Letter delete failed",
        employeeId,
        letterId,
        error,
      },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        employeeId,
        error,
      },
      { status: 500 },
    );
  }
}

export default function DeleteLetter() {
  const actionData = useActionData<typeof action>();

  const { employeeId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.employee_letters}${employeeId}`);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            (actionData?.error as any)?.message || actionData?.error?.message,
          variant: "destructive",
        });
      }
    }
    navigate(`/employees/${actionData?.employeeId}/letters`, { replace: true });
  }, [actionData, toast, navigate]);
  return null;
}

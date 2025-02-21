import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteExit } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { toast } from "@canny_ecosystem/ui/use-toast";
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
  const employeeId = params.employeeId as string;
  try {
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${deleteRole}:${attribute.exits}`))
      return safeRedirect(DEFAULT_ROUTE, { headers });
    const exitId = params.exitId;

    const { status } = await deleteExit({ supabase, id: exitId ?? "" });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        returnTo: `/employees/${employeeId}/payments`,
        message: "Exit deleted successfully.",
      });
    }

    return json({
      status: "error",
      returnTo: `/employees/${employeeId}/payments`,
      message: "Error deleting Exit. Please, Try again!",
    });
  } catch (error) {
    return json({
      status: "error",
      returnTo: `/employees/${employeeId}/payments`,
      message: error?.toString(),
    });
  }
}

export default function DeleteExit() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { employeeId } = useParams();

  useEffect(() => {
    if (actionData?.status === "success") {
      clearCacheEntry(cacheKeyPrefix.employee_payments);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.message,
        variant: "success",
      });
    }
    navigate(actionData?.returnTo ?? `/employees/${employeeId}/payments`);
  }, [actionData]);
}

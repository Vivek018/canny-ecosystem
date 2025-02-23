import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  hasPermission,
  isGoodStatus,
  LeaveTypeSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { updateLeaveTypeById } from "@canny_ecosystem/supabase/mutations";
import { getLeaveTypeById } from "@canny_ecosystem/supabase/queries";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import AddLeaveType from "../add-leave-type";

export const UPDATE_LEAVETYPE_TAG = "Update_LeaveType";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const leaveId = params.leaveTypeId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.holidays}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  let leaveData = null;
  let error = null;

  if (leaveId) {
    const { data, error: leaveError } = await getLeaveTypeById({
      supabase,
      leaveId,
    });

    leaveData = data;
    error = leaveError;
  }

  return json({ data: leaveData, error });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const id = params.leaveTypeId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: LeaveTypeSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateLeaveTypeById({
    leaveTypeId: id!,
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Leave type updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Leave Type update failed",
    error,
  });
}

export default function UpdateLeaveTypes() {
  const { data, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const updatableData = data;

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load leave type data",
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.holidays}`);
        toast({
          title: "Success",
          description: actionData?.message || "Leave type updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Failed to update leave type",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/holidays");
    }
  }, [actionData]);

  return <AddLeaveType updatableData={updatableData as any} />;
}

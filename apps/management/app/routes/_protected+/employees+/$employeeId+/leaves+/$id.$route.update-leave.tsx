import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  hasPermission,
  isGoodStatus,
  LeaveSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { updateLeavesById } from "@canny_ecosystem/supabase/mutations";
import { getLeavesById, getUsers } from "@canny_ecosystem/supabase/queries";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import AddLeaves from "./add-leaves";

export const UPDATE_LEAVES_TAG = "Update_Leave";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const leaveId = params.id;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.employeeLeaves}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  let leaveData = null;

  let error = null;
  if (leaveId) {
    const { data, error: leaveError } = await getLeavesById({
      supabase,
      leaveId,
    });

    leaveData = data;
    error = leaveError;
  }
  const { data: userData, error: userError } = await getUsers({ supabase });
  if (userError || !userData) {
    throw userError;
  }
  const userOptions = userData.map((userData) => ({
    label: userData.email?.toLowerCase(),
    value: userData.id,
  }));
  return json({ data: leaveData, error, userOptions });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const leaveId = params.id;
  const isEmployeeRoute = params.route;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: LeaveSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateLeavesById({
    leaveId: leaveId!,
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee Leave update successfully",
      error: null,
      isEmployeeRoute,
    });
  }
  return json({
    status: "error",
    message: "Employee leave update failed",
    error,
    isEmployeeRoute,
  });
}

export default function UpdateLeaves() {
  const { data, error, userOptions } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const updatableData = data;

  const { toast } = useToast();
  const navigate = useNavigate();
  const { employeeId } = useParams();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Leave update failed",
        variant: "destructive",
      });
    }
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.employee_leaves}${employeeId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Leave updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Leave update failed",
          variant: "destructive",
        });
      }
      console.log(
        typeof actionData.isEmployeeRoute,
        actionData.isEmployeeRoute
      );

      navigate(
        actionData.isEmployeeRoute === "true"
          ? `/employees/${employeeId}/leaves`
          : "/time-tracking/leaves"
      );
    }
  }, [actionData]);

  return (
    <AddLeaves
      updateValues={updatableData}
      userOptionsFromUpdate={userOptions as any}
    />
  );
}

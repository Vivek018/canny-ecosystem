import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import {
  hasPermission,
  isGoodStatus,
  LeaveEncashmentSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { getLeaveEncashmentById } from "@canny_ecosystem/supabase/queries";
import { updateLeaveEncashment } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import CreateLeaveEncashment from "./create-leave-encashment";

export const UPDATE_LEAVE_ENCASHMENT = "update-leave-encashment";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const leaveEncashmentId = params.leaveEncashmentId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${updateRole}:${attribute.statutoryFieldsLeaveEncashment}`,
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    let leaveEncashmentData = null;
    let leaveEncashmentError = null;

    if (leaveEncashmentId) {
      ({ data: leaveEncashmentData, error: leaveEncashmentError } =
        await getLeaveEncashmentById({
          supabase,
          id: leaveEncashmentId,
        }));

      if (leaveEncashmentError) throw leaveEncashmentError;

      return json({
        error: null,
        leaveEncashmentData,
        companyId,
      });
    }

    throw new Error("No identity key provided");
  } catch (error) {
    return json(
      {
        error,
        leaveEncashmentData: null,
        companyId: null,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: LeaveEncashmentSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateLeaveEncashment({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Leave encashment updated successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Leave encashment update failed",
      error,
    });
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

export default function UpdateLeaveEncashment() {
  const { leaveEncashmentData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.leave_encashment);
      toast({
        title: "Success",
        description: actionData?.message || "Leave encashment updated",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message || "Leave encashment update failed",
        variant: "destructive",
      });
    }
    navigate("/payment-components/statutory-fields/leave-encashment");
  }, [actionData]);

  if (error)
    return (
      <ErrorBoundary error={error} message="Failed to load leave encashment" />
    );

  return <CreateLeaveEncashment updateValues={leaveEncashmentData} />;
}

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Await,
  defer,
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
import { Suspense, useEffect } from "react";
import type { LeaveEncashmentDatabaseUpdate } from "@canny_ecosystem/supabase/types";
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
    let leaveEncashmentPromise = null;

    if (leaveEncashmentId) {
      leaveEncashmentPromise = getLeaveEncashmentById({
        supabase,
        id: leaveEncashmentId,
      });
    }

    return defer({
      error: null,
      leaveEncashmentPromise,
      companyId,
    });
  } catch (error) {
    return json(
      {
        error,
        leaveEncashmentPromise: null,
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

export default function UpdateEmployeeStateInsurance() {
  const { leaveEncashmentPromise, error } = useLoaderData<typeof loader>();
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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={leaveEncashmentPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load leave encashment" />;
          return (
            <UpdateLeaveEncashmentWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateLeaveEncashmentWrapper({
  data,
  error,
}: {
  data: LeaveEncashmentDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load gratuity",
        variant: "destructive",
      });
    }
  }, [error]);

  return <CreateLeaveEncashment updateValues={data} />;
}

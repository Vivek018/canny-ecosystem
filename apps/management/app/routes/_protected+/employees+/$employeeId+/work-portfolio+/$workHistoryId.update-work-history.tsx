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
import {
  EmployeeWorkHistorySchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getEmployeeWorkHistoryById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeWorkHistory } from "@canny_ecosystem/supabase/mutations";
import AddEmployeeWorkHistory from "./add-work-history";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_EMPLOYEE_WORK_HISTORY = "update-employee-work-history";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const workHistoryId = params.workHistoryId;
  const employeeId = params.employeeId;

  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${updateRole}:${attribute.employeeWorkHistory}`,
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    if (!employeeId) throw new Error("No employeeId provided");
    let workHistoryData = null;
    let workHistoryError = null;

    if (workHistoryId) {
      ({ data: workHistoryData, error: workHistoryError } =
        await getEmployeeWorkHistoryById({
          supabase,
          id: workHistoryId,
        }));
    }

    if (workHistoryError) throw workHistoryError;

    return json({
      workHistoryData,
      error: null,
    });
  } catch (error) {
    return json({
      error,
      workHistoryData: null,
    });
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const employeeId = params.employeeId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${updateRole}:${attribute.employeeWorkHistory}`,
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: EmployeeWorkHistorySchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateEmployeeWorkHistory({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Successfully updated employee work history",
        employeeId,
        error: null,
      });
    }
    return json({
      status: "error",
      message: "Failed to update employee work history",
      employeeId,
      error,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
      employeeId,
      data: null,
    });
  }
}

export default function UpdateEmployeeWorkHistory() {
  const { workHistoryData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { employeeId } = useParams();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`,
        );
        toast({
          title: "Success",
          description: actionData?.message || "Employee work history updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Failed to update",
          variant: "destructive",
        });
      }
      navigate(`/employees/${actionData?.employeeId}/work-portfolio`);
    }
  }, [actionData]);

  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load employee work history data"
      />
    );

  return <AddEmployeeWorkHistory updateValues={workHistoryData} />;
}

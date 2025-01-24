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
  EmployeeWorkHistorySchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getEmployeeWorkHistoryById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeWorkHistory } from "@canny_ecosystem/supabase/mutations";
import AddEmployeeWorkHistory from "./add-work-history";
import { Suspense, useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { EmployeeWorkHistoryDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";

export const UPDATE_EMPLOYEE_WORK_HISTORY = "update-employee-work-history";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const workHistoryId = params.workHistoryId;
  const employeeId = params.employeeId;

  let workHistoryPromise = null;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:employee_work_history`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    if (!employeeId) throw new Error("No employeeId provided");

    if (workHistoryId) {
      workHistoryPromise = getEmployeeWorkHistoryById({
        supabase,
        id: workHistoryId,
      });
    }

    return defer({
      workHistoryPromise,
      error: null,
    });
  } catch (error) {
    return json({
      error,
      workHistoryPromise: null,
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

  if (!hasPermission(user?.role!, `${updateRole}:employee_work_history`)) {
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
        { status: submission.status === "error" ? 400 : 200 }
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
  const { workHistoryPromise } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={workHistoryPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return (
              <ErrorBoundary message="Failed to load employee work history data" />
            );
          return (
            <UpdateEmployeeWorkHistoryWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateEmployeeWorkHistoryWrapper({
  data,
  error,
}: {
  data: EmployeeWorkHistoryDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load employee work history data"
      />
    );
  return <AddEmployeeWorkHistory updateValues={data} />;
}

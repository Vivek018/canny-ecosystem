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
  AttendanceSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import { UpdateAttendance } from "@canny_ecosystem/supabase/mutations";
import type { EmployeeMonthlyAttendanceDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import AddMonthlyAttendance from "./$employeeId.add-attendance";
import { getAttendanceById } from "@canny_ecosystem/supabase/queries";

export const UPDATE_ATTENDANCE_TAG = "Update-Attendance";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const attendanceId = params.attendanceId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.attendance}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  let attendanceData = null;
  let error = null;

  if (attendanceId) {
    const { data, error: attendanceError } = await getAttendanceById({
      supabase,
      id: attendanceId,
    });

    attendanceData = data;
    error = attendanceError;
  }

  return json({
    data: attendanceData as EmployeeMonthlyAttendanceDatabaseUpdate,
    error,
  });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const attendanceId = params.attendanceId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: AttendanceSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }
  const data = { ...submission.value, id: submission.value.id ?? attendanceId };

  const { status, error } = await UpdateAttendance({
    supabase,
    data,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee attendance updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Employee attendance update failed",
    error,
  });
}

export default function UpdateMonthlyAttendance() {
  const { data, error } = useLoaderData<typeof loader>();
  const updatableData = data;

  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load attendance data",
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.attendance);
        toast({
          title: "Success",
          description: actionData?.message || "Attendance updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Failed to update attendance",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/attendance");
    }
  }, [actionData]);

  return (
    <AddMonthlyAttendance
      updateValues={
        updatableData as unknown as EmployeeMonthlyAttendanceDatabaseUpdate
      }
    />
  );
}

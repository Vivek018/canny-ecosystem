import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteAttendanceByDate } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useEffect } from "react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useNavigate,
  useParams,
  useSearchParams,
} from "@remix-run/react";

export async function action({
  params,
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${deleteRole}:${attribute.employeeAttendance}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const date = params.date;

  const formData = await request.formData();
  const employeeId = formData.get("employeeId");

  try {
    const { error, status } = await deleteAttendanceByDate({
      supabase,
      date: date as string,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Attendance deleted successfully",
        error: null,
        employeeId,
      });
    }

    return json(
      {
        status: "error",
        message: "Failed to delete Attendance",
        error,
        employeeId,
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        employeeId,
      },
      { status: 500 }
    );
  }
}

export default function DeleteAttendance() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const { employeeId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.attendance}${employeeId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Employee address deleted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error || "Employee address delete failed",
          variant: "destructive",
        });
      }
      let query = "";

      if (month && year) {
        query = `?month=${month}&year=${year}`;
      } else if (month) {
        query = `?month=${month}`;
      } else if (year) {
        query = `?year=${year}`;
      }

      const url = `/employees/${employeeId}/attendance${query}`;
      navigate(url);
    }
  }, [actionData]);

  return null;
}

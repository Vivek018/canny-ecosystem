import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { updateMultipleAttendances } from "@canny_ecosystem/supabase/mutations";

import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const attendancesData = JSON.parse(
      formData.get("attendancesData") as string,
    );

    const { status, error } = await updateMultipleAttendances({
      attendancesData: attendancesData,
      supabase,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Attendances updated successfully",
        error: null,
      });
    }
    return json(
      {
        status: "error",
        message: "Attendances update failed",
        error,
      },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        data: null,
      },
      { status: 500 },
    );
  }
}

export default function UpdateBulkAttedances() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.attendance}`);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            (actionData?.error as any)?.message || actionData?.message,
          variant: "destructive",
        });
      }
      navigate("/time-tracking/attendance", { replace: true });
    }
  }, [actionData]);

  return null;
}

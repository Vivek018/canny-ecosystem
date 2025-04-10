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
  HolidaysSchema,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { updateHolidaysById } from "@canny_ecosystem/supabase/mutations";
import { getHolidaysById } from "@canny_ecosystem/supabase/queries";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearExactCacheEntry } from "@/utils/cache";
import AddHolidays from "../add-holiday";

export const UPDATE_HOLIDAYS_TAG = "Update_holidays";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const holidayId = params.holidayId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.holidays}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  let holidayData = null;
  let error = null;

  if (holidayId) {
    const { data, error: holidayError } = await getHolidaysById({
      supabase,
      holidayId,
    });

    holidayData = data;
    error = holidayError;
  }

  return json({ data: holidayData, error });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const id = params.holidayId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: HolidaysSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateHolidaysById({
    holidaysId: id!,
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Holiday updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Holiday update failed",
    error,
  });
}

export default function UpdateHolidays() {
  const { data, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const updatableData = data;

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load holiday data",
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.holidays);
        toast({
          title: "Success",
          description: actionData?.message || "Holiday updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            "Failed to update holiday",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/holidays");
    }
  }, [actionData]);

  return <AddHolidays updatableData={updatableData} />;
}

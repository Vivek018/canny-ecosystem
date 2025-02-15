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
  AccidentSchema,
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
import RegisterAccident from "./$employeeId.create-accident";
import { updateAccidentsById } from "@canny_ecosystem/supabase/mutations";
import { getAccidentsById } from "@canny_ecosystem/supabase/queries";
import type { AccidentsDatabaseUpdate } from "@canny_ecosystem/supabase/types";

export const UPDATE_ACCIDENTS_TAG = "Update-Accident";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const accidentId = params.accidentId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.accidents}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  let accidentData = null;
  let error = null;

  if (accidentId) {
    const { data, error: accidentError } = await getAccidentsById({
      supabase,
      accidentId,
    });

    accidentData = data;
    error = accidentError;
  }

  return json({ data: accidentData as AccidentsDatabaseUpdate, error });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const accidentId = params.accidentId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: AccidentSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }
  const data = [submission.value];

  const { status, error } = await updateAccidentsById({
    accidentId: accidentId!,
    supabase,
    data,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Employee accident updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Employee accident update failed",
    error,
  });
}

export default function UpdateAccidents() {
  const { data, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const updatableData = data;

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load accident data",
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.accident);
        toast({
          title: "Success",
          description: actionData?.message || "Accident updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Failed to update accident",
          variant: "destructive",
        });
      }
      navigate("/accidents");
    }
  }, [actionData]);

  return <RegisterAccident updateValues={updatableData} />;
}

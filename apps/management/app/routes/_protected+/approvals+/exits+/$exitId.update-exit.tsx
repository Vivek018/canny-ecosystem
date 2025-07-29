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
  ExitFormSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getExitsById } from "@canny_ecosystem/supabase/queries";
import { updateExit } from "@canny_ecosystem/supabase/mutations";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import CreateExit from "./$employeeId.create-exit";
import { clearCacheEntry } from "@/utils/cache";

export const UPDATE_EXIT = "update-exit";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const exitId = params.exitId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.exits}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    let exitData = null;
    let exitError = null;

    if (exitId) {
      ({ data: exitData, error: exitError } = await getExitsById({
        supabase,
        id: exitId,
      }));
    }

    if (exitError) throw exitError;

    return json({ exitData, error: null });
  } catch (error) {
    return json({ error, exitData: null }, { status: 500 });
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const exitId = params.exitId;
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    formData.set(
      "net_pay",
      String(
        Number(formData.get("bonus")) +
          Number(formData.get("leave_encashment")) +
          Number(formData.get("gratuity")) -
          Number(formData.get("deduction"))
      )
    );
    const submission = parseWithZod(formData, { schema: ExitFormSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateExit({
      supabase,
      data: {
        ...submission.value,
        id: submission.value.id ?? exitId,
      },
    });

    if (isGoodStatus(status))
      return json({ status: "success", message: "Exit updated", error: null });

    return json(
      { status: "error", message: "Exit update failed", error },
      { status: 500 },
    );
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

export default function UpdateExit() {
  const { exitData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description: (error as Error)?.message,
        variant: "destructive",
      });

    if (!actionData) return;

    if (actionData?.status === "success") {
      clearCacheEntry(cacheKeyPrefix.exits);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message ||
          actionData?.error ||
          "Exit update failed",
        variant: "destructive",
      });
    }
    navigate("/approvals/exits", { replace: true });
  }, [actionData]);

  return <CreateExit updateValues={exitData} />;
}

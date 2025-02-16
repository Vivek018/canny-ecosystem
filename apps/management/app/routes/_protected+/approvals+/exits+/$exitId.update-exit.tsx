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
  ExitFormSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getExitsById } from "@canny_ecosystem/supabase/queries";
import { updateExit } from "@canny_ecosystem/supabase/mutations";
import { Suspense, useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import type { ExitsUpdate } from "@canny_ecosystem/supabase/types";
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
    let exitPromise = null;

    if (exitId) exitPromise = getExitsById({ supabase, id: exitId });

    return defer({ exitPromise, error: null });
  } catch (error) {
    return json({ error, exitPromise: null }, { status: 500 });
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
    const submission = parseWithZod(formData, { schema: ExitFormSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { data: exitData } = await getExitsById({
      supabase,
      id: exitId as string,
    });

    const { status, error } = await updateExit({
      supabase,
      data: {
        ...submission.value,
        employee_id: exitData?.employee_id,
        id: exitId,
      } as any,
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
  const { exitPromise } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
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
        description: actionData?.error?.message || "Exit update failed",
        variant: "destructive",
      });
    }
    navigate("/approvals/exits", { replace: true });
  }, [actionData]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={exitPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load Exit" />;
          return (
            <UpdateExitWrapper
              data={resolvedData?.data}
              error={resolvedData?.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateExitWrapper({
  data,
  error,
}: {
  data: ExitsUpdate | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();
  useEffect(() => {
    if (error) {
      clearCacheEntry(cacheKeyPrefix.exits);
      toast({
        title: "Error",
        description: error?.message,
        variant: "destructive",
      });
    }
  }, [error]);

  return <CreateExit updateValues={data as any} />;
}

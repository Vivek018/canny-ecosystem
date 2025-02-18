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
import { safeRedirect } from "@/utils/server/http.server";
import {
  CaseSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { Suspense, useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import RegisterCase from "./create-case";
import { updateCaseById } from "@canny_ecosystem/supabase/mutations";
import { getCasesById } from "@canny_ecosystem/supabase/queries";
import { ErrorBoundary } from "@/components/error-boundary";

export const UPDATE_CASES_TAG = "Update-Case";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const caseId = params.caseId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  try {
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${updateRole}:${attribute.cases}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    let casePromise = null;

    if (caseId) {
      casePromise = getCasesById({
        supabase,
        caseId,
      });
    }

    return defer({ casePromise, error: null });
  } catch (error) {
    return json({ casePromise: null, error });
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const caseId = params.caseId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: CaseSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }
  const data = { ...submission.value, id: submission.value.id ?? caseId };

  const { status, error } = await updateCaseById({
    supabase,
    data,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Case updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Case update failed",
    error,
  });
}

export default function UpdateCases() {
  const { casePromise, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearCacheEntry(cacheKeyPrefix.case);
      toast({
        title: "Success",
        description: actionData?.message || "Case updated successfully",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message || "Failed to update case",
        variant: "destructive",
      });
    }
    navigate("/incidents/cases");
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load case" />;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={casePromise}>
        {(resolvedData) => {
          if (resolvedData?.error)
            return (
              <ErrorBoundary
                error={resolvedData?.error}
                message="Failed to load case"
              />
            );
          return <RegisterCase updateValues={resolvedData?.data} />;
        }}
      </Await>
    </Suspense>
  );
}

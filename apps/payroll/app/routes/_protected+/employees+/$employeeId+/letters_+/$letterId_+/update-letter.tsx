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
  EmployeeLetterSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getEmployeeLetterById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeLetter } from "@canny_ecosystem/supabase/mutations";
import { Suspense, useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import type { EmployeeLetterDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import CreateEmployeeLetter from "../create-letter";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_LETTER_TAG = "update-letter";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;
  const letterId = params.letterId;

  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.employeeLetters}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let employeeLetterPromise = null;

    if (letterId) {
      employeeLetterPromise = getEmployeeLetterById({
        supabase,
        id: letterId,
      });
    }

    return defer({
      employeeLetterPromise,
      employeeId,
      letterId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        employeeId,
        letterId,
        employeeLetterPromise: null,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: EmployeeLetterSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateEmployeeLetter({
      supabase,
      data: {
        ...submission.value,
      },
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Employee Letter updated",
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Employee Letter update failed",
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
      },
      { status: 500 },
    );
  }
}

export default function UpdateEmployeeLetter() {
  const { employeeLetterPromise, employeeId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(`${cacheKeyPrefix.employee_letters}${employeeId}`);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
      navigate(`/employees/${employeeId}/letters`, {
        replace: true,
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message,
        variant: "destructive",
      });
    }
  }, [actionData]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={employeeLetterPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load Letter" />;
          return (
            <UpdateEmployeeLetterWrapper
              data={resolvedData?.data}
              error={resolvedData?.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateEmployeeLetterWrapper({
  data,
  error,
}: {
  data: EmployeeLetterDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description: error?.message,
        variant: "destructive",
      });
  }, [error]);

  return <CreateEmployeeLetter updateValues={data} />;
}

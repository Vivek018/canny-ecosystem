import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateUser from "./create-user";
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
  hasPermission,
  isGoodStatus,
  UserSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { getUserById } from "@canny_ecosystem/supabase/queries";
import { updateUserById } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { Suspense, useEffect } from "react";
import type { UserDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import LoadingSpinner from "@/components/loader";

export const UPDATE_USER_TAG = "update-user";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = params.userId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.settingUsers}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let userPromise = null;

    if (userId) {
      userPromise = getUserById({
        supabase,
        id: userId,
      });
    }

    return defer({
      userPromise,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        userPromise: null,
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

    const submission = parseWithZod(formData, {
      schema: UserSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateUserById({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "User updated successfully",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to update user",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to update user",
        error,
      },
      { status: 500 },
    );
  }
}

export default function UpdateUser() {
  const { userPromise } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.users);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message || "User update failed",
        variant: "destructive",
      });
    }

    navigate("/settings/users", {
      replace: true,
    });
  }, [actionData]);

  return (
    <Suspense fallback={<LoadingSpinner className="h-96" />}>
      <Await resolve={userPromise}>
        {(resolvedData) => {
          if (!resolvedData) {
            return <ErrorBoundary message="Failed to load user" />;
          }
          return (
            <UpdateUserWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateUserWrapper({
  data,
  error,
}: {
  data: UserDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  if (error) {
    return <ErrorBoundary error={error} message="Failed to load user" />;
  }

  return <CreateUser updateValues={data} />;
}

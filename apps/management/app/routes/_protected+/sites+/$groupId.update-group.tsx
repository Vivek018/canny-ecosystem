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
  hasPermission,
  isGoodStatus,
  updateRole,
  GroupsSchema,
} from "@canny_ecosystem/utils";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import CreateGroup from "./$siteId.create-group";
import { getGroupById } from "@canny_ecosystem/supabase/queries";
import { updateGroupById } from "@canny_ecosystem/supabase/mutations";

export const UPDATE_GROUP_TAG = "update-group";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const groupId = params.groupId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.groups}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    if (groupId) {
      const { data, error } = await getGroupById({
        supabase,
        id: groupId,
      });

      if (error) throw error;

      return json({
        data,
        error: null,
      });
    }

    throw new Error("No identity key provided");
  } catch (error) {
    return json(
      {
        error,
        data: null,
        projectOptions: null,
        projectSiteOptions: null,
      },
      { status: 500 }
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
      schema: GroupsSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateGroupById({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Group updated successfully",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to update group",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to update group",
        error,
      },
      { status: 500 }
    );
  }
}

export default function UpdateGroup() {
  const { data, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.groups);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error ||
          actionData?.error?.message ||
          "Group update failed",
        variant: "destructive",
      });
    }

    navigate(-1, {
      replace: true,
    });
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load group" />;

  return <CreateGroup updateValues={data} />;
}

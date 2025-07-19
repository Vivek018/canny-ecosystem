import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateUser from "./create-user";
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
  UserSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import {
  getProjectsByCompanyId,
  getSitesByProjectId,
  getUserById,
} from "@canny_ecosystem/supabase/queries";
import { updateUserById } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { PROJECT_PARAM } from "@/components/employees/form/create-employee-project-assignment";

export const UPDATE_USER_TAG = "update-user";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = params.userId;
  const url = new URL(request.url);
  const urlSearchParams = new URLSearchParams(url.searchParams);
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.settingUsers}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const { data: projects } = await getProjectsByCompanyId({
      supabase,
      companyId,
    });

    const projectOptions = projects?.map((project) => ({
      label: project?.name,
      value: project?.id,
    }));

    let siteOptions: any = [];

    const projectParamId = urlSearchParams.get(PROJECT_PARAM);

    if (projectParamId?.length) {
      const { data: sites } = await getSitesByProjectId({
        supabase,
        projectId: projectParamId,
      });

      siteOptions = sites?.map((site) => ({
        label: site?.name,
        value: site?.id,
      }));
    }
    let userData = null;
    let userError = null;

    if (userId) {
      ({ data: userData, error: userError } = await getUserById({
        supabase,
        id: userId,
      }));

      if (userError) throw userError;

      return json({
        userData,
        projectOptions,
        siteOptions,
        error: null,
      });
    }

    throw new Error("No identity key provided");
  } catch (error) {
    return json(
      {
        error,
        userData: null,
        projectOptions: null,
        siteOptions: null,
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
      schema: UserSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
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
      { status: 500 }
    );
  }
}

export default function UpdateUser() {
  const { userData, error, projectOptions, siteOptions } =
    useLoaderData<typeof loader>();
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
        description:
          actionData?.error ||
          actionData?.error?.message ||
          "User update failed",
        variant: "destructive",
      });
    }

    navigate("/settings/users", {
      replace: true,
    });
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load user" />;

  return (
    <CreateUser
      updateValues={userData}
      projectOptions={projectOptions as unknown as any}
      siteOptions={siteOptions as unknown as any}
    />
  );
}

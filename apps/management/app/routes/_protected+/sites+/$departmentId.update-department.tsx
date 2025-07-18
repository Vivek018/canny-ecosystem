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
  DepartmentsSchema,
} from "@canny_ecosystem/utils";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import CreateDepartment from "./$siteId.create-department";
import { getDepartmentById } from "@canny_ecosystem/supabase/queries";
import { updateDepartmentById } from "@canny_ecosystem/supabase/mutations";

export const UPDATE_DEPARTMENT_TAG = "update-department";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const departmentId = params.departmentId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.departments}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    if (departmentId) {
      const { data, error } = await getDepartmentById({
        supabase,
        id: departmentId,
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
      schema: DepartmentsSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateDepartmentById({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Department updated successfully",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to update department",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to update department",
        error,
      },
      { status: 500 }
    );
  }
}

export default function UpdateDepartment() {
  const { data, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.departments);
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
          "Department update failed",
        variant: "destructive",
      });
    }

    navigate(-1, {
      replace: true,
    });
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load department" />;

  return <CreateDepartment updateValues={data} />;
}

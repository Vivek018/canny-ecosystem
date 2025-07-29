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
import CreateDepartment from "./create-department";
import {
  getDepartmentById,
  getSiteNamesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { updateDepartmentById } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const UPDATE_DEPARTMENT_TAG = "update-department";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const departmentId = params.departmentId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.departments}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {
    if (departmentId) {
      const { data, error } = await getDepartmentById({
        supabase,
        id: departmentId,
      });

      const { data: siteNamesData, error: siteNamesError } =
        await getSiteNamesByCompanyId({ supabase, companyId });

      if (error ?? siteNamesError) throw error ?? siteNamesError;

      return json({
        data,
        siteOptions: siteNamesData?.map((site) => ({
          label: site.name,
          pseudoLabel: site?.projects?.name,
          value: site.id,
        })),
        error: null,
      });
    }

    throw new Error("No identity key provided");
  } catch (error) {
    return json(
      {
        data: null,
        siteOptions: null,
        error,
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
        message: "Department Updated successfully",
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
  const { data, siteOptions, error } = useLoaderData<typeof loader>();
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
          actionData?.error?.message ||
          actionData?.error ||
          "Department update failed",
        variant: "destructive",
      });
    }

    navigate("/modules/departments", {
      replace: true,
    });
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load department" />;

  return <CreateDepartment siteFromUpdate={siteOptions} updateValues={data} />;
}

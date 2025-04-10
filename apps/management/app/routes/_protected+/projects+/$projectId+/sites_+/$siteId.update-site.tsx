import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateSite from "./create-site";
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
  SiteSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import {
  getLocationsForSelectByCompanyId,
  getSiteById,
} from "@canny_ecosystem/supabase/queries";
import { updateSite } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_SITE = "update-site";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const siteId = params.siteId;
  const projectId = params.projectId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.projectSite}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    if (!projectId) throw new Error("No projectId provided");

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data: locationOptionsData, error: locationOptionsError } =
      await getLocationsForSelectByCompanyId({
        supabase,
        companyId,
      });

    if (locationOptionsError) throw locationOptionsError;

    let siteData = null;
    let siteError = null;

    if (siteId) {
      ({ data: siteData, error: siteError } = await getSiteById({
        supabase,
        id: siteId,
      }));

      if (siteError) throw siteError;

      return json({
        error: null,
        siteData,
        locationOptions: locationOptionsData?.map((location) => ({
          label: location.name,
          value: location.id,
        })),
        projectId,
        siteId,
      });
    }

    throw new Error("Site ID not provided");
  } catch (error) {
    return json(
      {
        error,
        siteData: null,
        locationOptions: null,
        projectId,
        siteId,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const projectId = params.projectId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: SiteSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateSite({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Site updated",
        error: null,
        projectId,
      });
    }
    return json({
      status: "error",
      message: "Site update failed",
      error,
      projectId,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to update site",
        error,
      },
      { status: 500 },
    );
  }
}

export default function UpdateSite() {
  const { siteData, error, projectId, siteId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.sites}${projectId}`);
        clearExactCacheEntry(`${cacheKeyPrefix.site_overview}${siteId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Site updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error.message || "Site update failed",
          variant: "destructive",
        });
      }
      navigate(`/projects/${projectId}/sites`, {
        replace: true,
      });
    }
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load site" />;

  return <CreateSite updateValues={siteData} />;
}

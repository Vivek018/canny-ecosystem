import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateSite from "../create-site";
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
  getProjectsByCompanyId,
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
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.site}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {

    const { data: locationOptionsData, error: locationOptionsError } =
      await getLocationsForSelectByCompanyId({
        supabase,
        companyId,
      });

    const { data: projectsData, error: projectsError } = await getProjectsByCompanyId({ supabase, companyId });


    if (locationOptionsError ?? projectsError) throw locationOptionsError ?? projectsError;

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
        projectOptions: projectsData?.map((project) => ({
          label: project?.name,
          value: project?.id,
        })),
      });
    }

    throw new Error("Site ID not provided");
  } catch (error) {
    return json(
      {
        error,
        siteData: null,
        locationOptions: null,
        projectOptions: null,
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
      });
    }
    return json({
      status: "error",
      message: "Site update failed",
      error,
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
  const {  siteData, error, locationOptions, projectOptions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.sites);
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
      navigate("/modules/sites", {
        replace: true,
      });
    }
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load site" />;

  return <CreateSite locationFromUpdate={locationOptions} projectFromUpdate={projectOptions} updateValues={siteData} />;
}

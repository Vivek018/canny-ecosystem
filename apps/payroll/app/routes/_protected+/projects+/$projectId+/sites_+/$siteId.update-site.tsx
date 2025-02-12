import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateSite from "./create-site";
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
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import type { SiteDatabaseUpdate } from "@canny_ecosystem/supabase/types";
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

    const locationOptionsPromise = getLocationsForSelectByCompanyId({
      supabase,
      companyId,
    }).then(({ data, error }) => {
      if (data) {
        const locationOptions = data.map((location) => ({
          label: location.name,
          value: location.id,
        }));
        return { data: locationOptions, error };
      }
      return { data, error };
    });

    let sitePromise = null;

    if (siteId) {
      sitePromise = getSiteById({
        supabase,
        id: siteId,
      });
    }

    return defer({
      error: null,
      sitePromise,
      locationOptionsPromise,
      projectId,
    });
  } catch (error) {
    return json(
      {
        error,
        sitePromise: null,
        locationOptionsPromise: null,
        projectId,
      },
      { status: 500 }
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
        { status: submission.status === "error" ? 400 : 200 }
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
      { status: 500 }
    );
  }
}

export default function UpdateSite() {
  const { sitePromise, error, projectId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.sites}${projectId}`);
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
    return <ErrorBoundary error={error} message='Failed to load site' />;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={sitePromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message='Failed to load site' />;
          return (
            <UpdateSiteWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateSiteWrapper({
  data,
  error,
}: {
  data: SiteDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load site",
        variant: "destructive",
      });
    }
  }, [error]);

  return <CreateSite updateValues={data} />;
}

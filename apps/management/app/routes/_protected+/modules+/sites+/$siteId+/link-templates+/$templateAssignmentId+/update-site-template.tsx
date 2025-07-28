import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import {
  hasPermission,
  isGoodStatus,
  SiteLinkSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import {
  getPaymentTemplateAssignmentById,
  getPaymentTemplatesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { updatePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import CreateSiteTemplate from "../create-site-template";

export const UPDATE_SITE_TEMPLATE = "update-site-template";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { templateAssignmentId, siteId } = params;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.site}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  let paymentTemplatesOptions = null;
  let templatesData = null;
  try {
    if (!siteId) throw new Error("No siteId provided");

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data } = await getPaymentTemplatesByCompanyId({
      supabase,
      companyId,
    });
    if (data) {
      paymentTemplatesOptions = data.map((template) => ({
        label: template.name,
        value: template.id ?? "",
      }));
    }

    if (templateAssignmentId) {
      const { data, error } = await getPaymentTemplateAssignmentById({
        supabase,
        id: templateAssignmentId,
      });

      if (data && !error) {
        templatesData = data;
      }
    }

    return json({
      error: null,
      templatesData,
      paymentTemplatesOptions,
    });
  } catch (error) {
    return json(
      {
        error,
        templatesData,
        paymentTemplatesOptions,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { templateAssignmentId, siteId, projectId } = params;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: SiteLinkSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updatePaymentTemplateAssignment({
      supabase,
      data: submission.value,
      id: templateAssignmentId as string,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Site template updated successfully",
        error: null,
        projectId,
        siteId,
      });
    }
    return json({
      status: "error",
      message: "Failed to update site template",
      error,
      projectId,
      siteId,
    });
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

export default function UpdateSiteTemplate() {
  const { error, templatesData, paymentTemplatesOptions } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { projectId, siteId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(`${cacheKeyPrefix.site_link_templates}${siteId}`);
        toast({
          title: "Success",
          description: actionData?.message || "Site template updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Site template update failed",
          variant: "destructive",
        });
      }
      navigate(`/projects/${projectId}/${siteId}/link-templates`, {
        replace: true,
      });
    }
  }, [actionData]);

  if (error)
    return (
      <ErrorBoundary error={error} message="Failed to load site template" />
    );

  return (
    <CreateSiteTemplate
      updateValues={templatesData}
      updatePaymentTemplatesOptions={paymentTemplatesOptions}
    />
  );
}

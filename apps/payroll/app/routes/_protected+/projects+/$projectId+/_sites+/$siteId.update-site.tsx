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
import { isGoodStatus, SiteSchema } from "@canny_ecosystem/utils";
import {
  getLocationsForSelectByCompanyId,
  getSiteById,
} from "@canny_ecosystem/supabase/queries";
import { updateSite } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";

export const UPDATE_SITE = "update-site";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const siteId = params.siteId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data: locations, error } = await getLocationsForSelectByCompanyId({
      supabase,
      companyId,
    });

    if (error) {
      return json({
        status: "error",
        message: "Failed to get locations",
        error,
        locations,
      });
    }

    if (!locations) {
      return json({
        status: "error",
        message: "No locations found",
        error,
        locations,
      });
    }

    const locationOptions = locations.map((location) => ({
      label: location.name,
      value: location.id,
    }));

    let siteData = null;

    if (siteId) {
      siteData = await getSiteById({
        supabase,
        id: siteId,
      });
    }

    if (siteData?.error) {
      return json({
        status: "error",
        message: "Failed to get site",
        error: siteData.error,
        data: siteData.data,
      });
    }

    return json({
      status: "success",
      message: "Site found",
      error: null,
      data: siteData?.data,
      locationOptions,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    }, { status: 500 });
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
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 },
    );
  }
}

export default function UpdateSite() {
  const { data, locationOptions, status, error } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: error.message || "Failed to load",
        variant: "destructive",
      });
      navigate(`/projects/${data?.projectId}/sites`, { replace: true });
    }

    if (actionData) {
      if (actionData?.status === "success") {
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
      navigate(`/projects/${data?.projectId}/sites`, {
        replace: true,
      });
    }
  }, [actionData]);

  return (
    <CreateSite
      updateValues={data}
      locationOptionsFromUpdate={locationOptions}
    />
  );
}

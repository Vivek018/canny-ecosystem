import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateSite from "./create-site";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { isGoodStatus, SiteSchema } from "@canny_ecosystem/utils";
import {
  getLocationsForSelectByCompanyId,
  getSiteById,
} from "@canny_ecosystem/supabase/queries";
import { updateSite } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const UPDATE_SITE = "update-site";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const siteId = params.siteId;

  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data: locations, error } = await getLocationsForSelectByCompanyId({
    supabase,
    companyId,
  });

  if (error) {
    throw error;
  }

  if (!locations) {
    throw new Error("No Locations Found");
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
    throw siteData.error;
  }

  return json({ data: siteData?.data, locationOptions });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const projectId = params.projectId;
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
    return safeRedirect(`/projects/${projectId}/sites`, {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function UpdateSite() {
  const { data, locationOptions } = useLoaderData<typeof loader>();
  return (
    <CreateSite
      updateValues={data}
      locationOptionsFromUpdate={locationOptions}
    />
  );
}

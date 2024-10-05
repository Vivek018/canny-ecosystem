import { ProjectDetailedPage } from "@/components/projects/project-detailed-page";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getProjectById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data, error } = await getProjectById({
    supabase,
    id: projectId ?? "",
    companyId,
  });

  if (error) {
    return safeRedirect("/projects", { status: 303 });
  }

  if (!data) {
    throw new Error("No data found");
  }

  return json({ data });
}

export default function ProjectIndex() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <div className="-mt-4">
      <ProjectDetailedPage project={data} />
    </div>
  );
}

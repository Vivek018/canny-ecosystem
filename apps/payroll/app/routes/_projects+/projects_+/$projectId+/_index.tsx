import { ProjectDetails } from "@/components/projects/project/project-details";
import { ProjectHeader } from "@/components/projects/project/project-header";
import { ProjectInformationCard } from "@/components/projects/project/project-information-card";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getProjectById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Card } from "@canny_ecosystem/ui/card";
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
    <div className="w-full my-4">
      <Card className="my-4 rounded w-full h-full p-4 flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col w-full gap-6">
          <ProjectHeader project={data} />
          <div className="flex flex-col w-full justify-between lg:flex-row gap-6">
            <ProjectDetails project={data} />
            <ProjectInformationCard project={data} />
          </div>
        </div>
      </Card>
    </div>
  );
}

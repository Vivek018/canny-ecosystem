import { ProjectDetails } from "@/components/projects/project/project-details";
import { ProjectHeader } from "@/components/projects/project/project-header";
import { ProjectInformationCard } from "@/components/projects/project/project-information-card";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getProjectById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Card } from "@canny_ecosystem/ui/card";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const projectId = params.projectId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data, error } = await getProjectById({
      supabase,
      id: projectId ?? "",
      companyId,
    });

    if (error) {
      return json({
        status: "error",
        message: "Failed to get project",
        error,
        data: null,
      });
    }

    if (!data) {
      return json({
        status: "error",
        message: "Project not found",
        error: null,
        data: null,
      });
    }

    return json({
      status: "success",
      message: "Project found",
      error: null,
      data,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
      data: null,
    }, { status: 500 });
  }
}

export default function ProjectIndex() {
  const { data, error, status } = useLoaderData<typeof loader>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: error?.message || "Project not found",
        variant: "destructive",
      });
      navigate("/projects", { replace: true });
    }
  }, [status]);

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

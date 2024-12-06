import { ErrorBoundary } from "@/components/error-boundary";
import { ProjectOverviewWrapper } from "@/components/projects/project/project-overview-wrapper";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getProjectById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { defer, json, type LoaderFunctionArgs } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const projectPromise = getProjectById({
      supabase,
      id: projectId ?? "",
      companyId,
    });

    return defer({
      status: "success",
      message: "Project found",
      error: null,
      projectPromise,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        projectPromise: null,
      },
      { status: 500 },
    );
  }
}

export default function ProjectIndex() {
  const { projectPromise, error } = useLoaderData<typeof loader>();

  if (error)
    return <ErrorBoundary error={error} message="Failed to load projects" />;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={projectPromise}>
        {(resolvedData) => (
          <ProjectOverviewWrapper projectData={resolvedData} />
        )}
      </Await>
    </Suspense>
  );
}

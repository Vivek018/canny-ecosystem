import { Card } from "@canny_ecosystem/ui/card";
import { ProjectHeader } from "./project-header";
import { ProjectDetails } from "./project-details";
import { ProjectInformationCard } from "./project-information-card";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";

import { ErrorBoundary } from "@/components/error-boundary";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { useParams } from "@remix-run/react";
import type { ProjectsWithCompany } from "@canny_ecosystem/supabase/queries";

export function ProjectOverviewWrapper({
  data,
  error,
}: {
  data: Omit<ProjectsWithCompany, "created_at" | "updated_at"> | null;
  error: Error | null | { message: string };
}) {
  const { projectId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(`${cacheKeyPrefix.project_overview}${projectId}`);
      toast({
        title: "Error",
        description: error?.message || "Failed to load project",
        variant: "destructive",
      });
    }
  }, [error]);

  if (!data) {
    clearExactCacheEntry(`${cacheKeyPrefix.project_overview}${projectId}`);
    return <ErrorBoundary error={error} message="Failed to load project" />;
  }

  return (
    <div className="w-full py-4">
      <Card className="rounded w-full h-full p-4 flex flex-col lg:flex-row gap-4">
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

import { Card } from "@canny_ecosystem/ui/card";
import { ProjectHeader } from "./project-header";
import { ProjectDetails } from "./project-details";
import { ProjectInformationCard } from "./project-information-card";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { ProjectDatabaseRow } from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";

export function ProjectOverviewWrapper({
  data,
  error,
}: {
  data: Omit<ProjectDatabaseRow, "created_at" | "updated_at"> | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load project",
        variant: "destructive",
      });
    }
  }, [error]);

  if (!data)
    return <ErrorBoundary error={error} message="Failed to load project" />;

  return (
    <div className="w-full my-4">
      <Card className="my-4 rounded w-full h-full p-4 flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col w-full gap-6">
          <ProjectHeader project={data} />
          <div className="flex flex-col w-full justify-between lg:flex-row gap-6">
            <ProjectDetails project={data as any} />
            <ProjectInformationCard project={data} />
          </div>
        </div>
      </Card>
    </div>
  );
}

import { CommandItem } from "@canny_ecosystem/ui/command";
import { ProjectCard } from "./project-card";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import type { ProjectDatabaseRow } from "@canny_ecosystem/supabase/types";

export function ProjectsWrapper({
  data,
  error,
}: {
  data: Omit<ProjectDatabaseRow, "created_at" | "updated_at">[] | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(cacheKeyPrefix.projects);
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-2">
      {data?.map((project) => (
        <CommandItem
          key={project.id}
          value={
            project?.id +
            project?.name +
            project?.description +
            project?.project_type +
            project?.start_date +
            project?.end_date +
            project?.status +
            project?.company_id
          }
          className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
        >
          <ProjectCard project={project} />
        </CommandItem>
      ))}
    </div>
  );
}

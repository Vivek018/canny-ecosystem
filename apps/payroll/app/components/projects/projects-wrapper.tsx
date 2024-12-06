import { CommandItem } from "@canny_ecosystem/ui/command";
import { ProjectCard } from "./project-card";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { ProjectsWithCompany } from "@canny_ecosystem/supabase/queries";

export function ProjectsWrapper({ resolvedData: { data, error } }: any) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <div className="w-full grid gap-8 grid-cols-1">
      {data?.map((project: ProjectsWithCompany) => (
        <CommandItem
          key={project.id}
          value={
            project?.name +
            project?.status +
            project?.project_type +
            project?.project_code +
            project?.primary_contractor?.name +
            project?.project_client?.name +
            project?.end_client?.name
          }
          className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
        >
          <ProjectCard project={project} />
        </CommandItem>
      ))}
    </div>
  );
}

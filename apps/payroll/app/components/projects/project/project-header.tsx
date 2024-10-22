import type { ProjectDatabaseRow } from "@canny_ecosystem/supabase/types";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";
import { ProjectOptionsDropdown } from "../project-options-dropdown";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";

export const ProjectHeader = ({
  project,
}: {
  project: Pick<ProjectDatabaseRow, "status" | "id" | "actual_end_date">;
}) => {
  return (
    <div className="flex flex-row items-center justify-between">
      <div
        className={cn(
          "rounded-sm flex items-center",
          ["completed", "active"].includes(project.status) && "text-green",
          ["cancelled", "inactive"].includes(project.status) &&
            "text-destructive",
          ["pending"].includes(project.status) && "text-yellow-500",
        )}
      >
        <Icon name="dot-filled" className="mt-[1px]" />
        <p className={cn("ml-0.5 text-sm font-medium capitalize")}>
          {project.status}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          prefetch="intent"
          to={`/projects/${project.id}/update-project`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <Icon name="edit" size="xs" className="mr-1.5" />
          <p>Edit</p>
        </Link>
        <ProjectOptionsDropdown
          project={{
            id: project.id,
            actual_end_date: project.actual_end_date,
            returnTo: `/projects/${project.id}`,
          }}
          triggerChild={
            <DropdownMenuTrigger
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Icon name="dots" size="xs" className="mr-1.5" />
              <p>More Options</p>
            </DropdownMenuTrigger>
          }
        />
      </div>
    </div>
  );
};

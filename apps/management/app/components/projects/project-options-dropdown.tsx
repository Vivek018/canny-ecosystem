import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteProject } from "./delete-project";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSubmit } from "@remix-run/react";
import {
  deleteRole,
  getValidDateForInput,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ProjectDatabaseRow } from "@canny_ecosystem/supabase/types";

export const ProjectOptionsDropdown = ({
  project,
  triggerChild,
}: {
  project: Omit<ProjectDatabaseRow, "created_at" | "updated_at">;
  triggerChild: React.ReactElement;
}) => {
  const submit = useSubmit();
  const { role } = useUser();
  const handleMarkAsCompleted = () => {
    submit(
      {
        id: project.id,
        end_date: getValidDateForInput(new Date())!,
        status: "completed",
        returnTo: "/modules/projects",
      },
      {
        method: "POST",
        action: `${project.id}/update-completed`,
      },
    );
  };

  const handleMarkAsActive = () => {
    submit(
      {
        id: project.id,
        actual_end_date: null,
        status: "active",
        returnTo: "/modules/",
      },
      {
        method: "POST",
        action: `${project.id}/update-completed`,
      },
    );
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              project.status === "completed" && "hidden",
              !hasPermission(role, `${updateRole}:${attribute.projects}`) &&
                "hidden",
            )}
            onClick={handleMarkAsCompleted}
          >
            Make as Completed
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              project.status === "active" && "hidden",
              !hasPermission(role, `${updateRole}:${attribute.projects}`) &&
                "hidden",
            )}
            onClick={handleMarkAsActive}
          >
            Make as Active
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.projects}`) &&
                "flex",
            )}
          />
          <DeleteProject projectId={project.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

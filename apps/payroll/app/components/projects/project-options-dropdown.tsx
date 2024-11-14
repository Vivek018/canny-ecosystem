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
import { getValidDateForInput } from "@canny_ecosystem/utils";

export const ProjectOptionsDropdown = ({
  project,
  triggerChild,
}: {
  project: {
    id: string;
    actual_end_date: string | null;
    returnTo?: string;
  };
  triggerChild: React.ReactElement;
}) => {
  const submit = useSubmit();

  const handleMarkAsCompleted = () => {
    submit(
      {
        id: project.id,
        actual_end_date: getValidDateForInput(new Date())!,
        status: "completed",
        returnTo: project.returnTo ?? "/projects",
      },
      {
        method: "POST",
        action: `/projects/${project.id}/update-completed`,
      },
    );
  };

  const handleMarkAsActive = () => {
    submit(
      {
        id: project.id,
        actual_end_date: null,
        status: "active",
        returnTo: project.returnTo ?? "/projects",
      },
      {
        method: "POST",
        action: `/projects/${project.id}/update-completed`,
      },
    );
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(project.actual_end_date && "hidden")}
            onClick={handleMarkAsCompleted}
          >
            Make as Completed
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(!project.actual_end_date && "hidden")}
            onClick={handleMarkAsActive}
          >
            Make as Active
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteProject projectId={project.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

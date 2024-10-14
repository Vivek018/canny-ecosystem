import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteProject } from "./delete-project";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSubmit } from "@remix-run/react";
import { getValidDateForInput } from "@canny_ecosystem/utils";

export const ProjectOptionsDropdown = ({project, triggerChild}: {project: {
  id: string;
  actual_end_date: string | null;
}, triggerChild: React.ReactElement}) => {

  const submit = useSubmit();

  const handleMarkAsCompleted = () => {
    submit(
      {
        id: project.id,
        actual_end_date: getValidDateForInput(new Date())!,
        status: "completed",
      },
      {
        method: "POST",
        action: `/${project.id}/update-completed`,
      },
    );
  };

  const handleMarkAsInComplete = () => {
    submit(
      {
        id: project.id,
        actual_end_date: null,
        status: "active",
      },
      {
        method: "POST",
        action: `/${project.id}/update-completed`,
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
            onClick={handleMarkAsInComplete}
          >
            Make as Incomplete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteProject projectId={project.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

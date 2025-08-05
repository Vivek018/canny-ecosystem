import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { Link } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  formatDate,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { ProjectOptionsDropdown } from "./project-options-dropdown";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ProjectDatabaseRow } from "@canny_ecosystem/supabase/types";

export function ProjectCard({
  project,
}: {
  project: Omit<ProjectDatabaseRow, "created_at">;
}) {
  const { role } = useUser();

  return (
    <Card
      key={project.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-start justify-between p-4">
        <div className="flex flex-col items-start gap-1">
          <CardTitle className="text-lg tracking-wide gap-1">
            {replaceUnderscore(project.name ?? "")}
          </CardTitle>
          <div className="flex gap-1.5">
            <div className="text-[10px] font-light px-1.5 bg-muted-foreground text-muted rounded-sm">
              {project.project_type}
            </div>
            <div className="text-[10px] font-light px-1.5 bg-muted text-muted-foreground rounded-sm">
              {project.status}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`${project.id}/update-project`}
                  className={cn(
                    "p-2 rounded-md bg-secondary grid place-items-center",
                    !hasPermission(
                      role,
                      `${updateRole}:${attribute.projects}`,
                    ) && "hidden",
                  )}
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ProjectOptionsDropdown
            project={project}
            triggerChild={
              <DropdownMenuTrigger className="p-2 py-2 rounded-md bg-secondary grid place-items-center">
                <Icon name="dots-vertical" size="xs" />
              </DropdownMenuTrigger>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-4">
        <div className="line-clamp-3">{project.description}</div>
      </CardContent>
      <CardFooter
        className={cn(
          "mx-4 mb-1.5 mt-auto p-0 py-1.5 text-foreground text-xs flex gap-1 justify-between font-semibold",
        )}
      >
        <p
          className={cn(
            "text-green bg-green/25 rounded-md p-1 flex items-center gap-1 capitalize",
            !formatDate(project.start_date) && "hidden",
          )}
        >
          <Icon name="clock" size="xs" className="scale-x-[-1]" />
          {formatDate(project.start_date)}
        </p>
        <p
          className={cn(
            "text-destructive bg-destructive/25 rounded-md flex items-center gap-1 p-1 capitalize",
            !formatDate(project.end_date) && "hidden",
          )}
        >
          <Icon name="clock" size="xs" />
          {formatDate(project.end_date)}
        </p>
      </CardFooter>
    </Card>
  );
}

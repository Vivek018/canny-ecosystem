import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { Link } from "@remix-run/react";
import { Card, CardContent, CardTitle } from "@canny_ecosystem/ui/card";
import type { ProjectsWithCompany } from "@canny_ecosystem/supabase/queries";
import { Avatar, AvatarFallback } from "@canny_ecosystem/ui/avatar";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Progress } from "@canny_ecosystem/ui/progress";
import {
  deleteRole,
  getAutoTimeDifference,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { ProjectOptionsDropdown } from "./project-options-dropdown";
import { useUserRole } from "@/utils/user";

export function ProjectCard({
  project,
}: {
  project: Omit<ProjectsWithCompany, "created_at" | "updated_at">;
}) {
  const { role } = useUserRole();
  const companies = [
    project?.project_client,
    project?.primary_contractor,
    project?.end_client,
  ];

  return (
    <Card
      key={project.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardContent className="flex flex-row gap-0.5 justify-between items-center p-4">
        <div className="flex items-center flex-1 gap-10 justify-between pr-12">
          <CardTitle className="text-xl tracking-wide">
            <Link
              prefetch="intent"
              to={`${project?.id}`}
              className="truncate max-w-96 font-bold text-wrap line-clamp-2 hover:text-primary"
            >
              {project.name}
            </Link>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] bg-muted-foreground w-max text-muted px-1.5 mt-1.5 rounded-md">
                {project.status}
              </p>
              <p className="text-[11px] bg-muted w-max text-muted-foreground px-1.5 mt-1.5 rounded-md">
                {project.project_type}
              </p>
            </div>
          </CardTitle>
          <div className="flex flex-col items-center gap-1">
            <TooltipProvider>
              <div className="flex items-center">
                {companies.map((company, index) =>
                  company?.id ? (
                    <Tooltip key={company?.id} delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Avatar
                          className={cn(
                            "w-12 h-12 border border-muted-foreground/30 shadow-sm hover:z-40",
                            index !== 0 && "-ml-[18px]"
                          )}
                        >
                          {company?.logo && (
                            <img src={company?.logo} alt={company?.name} />
                          )}
                          <AvatarFallback>
                            <span className="tracking-widest text-sm">
                              {company?.name.charAt(0)}
                            </span>
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{company?.name}</TooltipContent>
                    </Tooltip>
                  ) : null
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Companies Involved
              </p>
            </TooltipProvider>
          </div>
          <div
            className={cn("flex flex-col", project.actual_end_date && "hidden")}
          >
            <Progress
              value={
                (getAutoTimeDifference(project.start_date, new Date())! /
                  getAutoTimeDifference(
                    project.start_date,
                    project.estimated_end_date
                  )!) *
                100
              }
              className="w-80"
            />
            <p
              className={cn(
                "text-xs text-muted-foreground ml-auto mt-1",
                getAutoTimeDifference(new Date(), project.estimated_end_date)! <
                  0 && "hidden"
              )}
            >
              {getAutoTimeDifference(new Date(), project.estimated_end_date)}{" "}
              days remaining
            </p>
          </div>
          <div
            className={cn(
              "flex flex-col",
              !project.actual_end_date && "hidden"
            )}
          >
            <Progress value={100} className="w-80" />
            <p
              className={cn(
                "text-xs text-muted-foreground ml-auto mt-1",
                !project.actual_end_date && "hidden"
              )}
            >
              Took{" "}
              {getAutoTimeDifference(
                project.start_date,
                project.actual_end_date
              )}{" "}
              days
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  to={`/projects/${project.id}/update-project`}
                  className={cn(
                    "p-2 rounded-md bg-secondary grid place-items-center border-foreground ",
                    !hasPermission(`${role}`, `${deleteRole}:projects`) &&
                      "hidden"
                  )}
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ProjectOptionsDropdown
            project={{
              id: project.id,
              actual_end_date: project.actual_end_date,
            }}
            triggerChild={
              <DropdownMenuTrigger
                className={cn(
                  "p-2 py-2 rounded-md bg-secondary grid place-items-center border-foreground",
                  !hasPermission(`${role}`, `${deleteRole}:projects`) &&
                    !hasPermission(`${role}`, `${updateRole}:projects`) &&
                    "hidden"
                )}
              >
                <Icon name="dots-vertical" size="xs" />
              </DropdownMenuTrigger>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

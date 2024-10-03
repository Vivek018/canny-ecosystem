import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { Link, useSubmit } from "@remix-run/react";
import { Card, CardContent, CardTitle } from "@canny_ecosystem/ui/card";
import { DeleteProject } from "./delete-project";
import type { ProjectsWithCompany } from "@canny_ecosystem/supabase/queries";
import { Avatar, AvatarFallback } from "@canny_ecosystem/ui/avatar";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Progress } from "@canny_ecosystem/ui/progress";
import {
  getAutoTimeDifference,
  getValidDateForInput,
} from "@canny_ecosystem/utils";

export function ProjectCard({
  project,
}: {
  project: Omit<
    ProjectsWithCompany,
    "created_at" | "updated_at" | "company_id"
  >;
}) {
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
              className="truncate max-w-96 font-extrabold text-wrap line-clamp-2 hover:text-primary"
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
              <p className="text-[11px] bg-muted w-max text-muted-foreground px-1.5 mt-1.5 rounded-md">
                {project.project_code}
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
                            index !== 0 && "-ml-[18px]",
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
                  ) : null,
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
                project.estimated_end_date
                  ? getAutoTimeDifference(
                      project.start_date,
                      new Date(),
                      "months",
                    )
                  : 0
              }
              max={
                getAutoTimeDifference(
                  project.start_date,
                  project.estimated_end_date,
                  "months",
                )!
              }
              className="w-80"
            />
            <p
              className={cn(
                "text-xs text-muted-foreground ml-auto mt-1",
                getAutoTimeDifference(
                  new Date(),
                  project.estimated_end_date,
                  "months",
                )! < 0 && "hidden",
              )}
            >
              {getAutoTimeDifference(
                new Date(),
                project.estimated_end_date,
                "months",
              )}{" "}
              months remaining
            </p>
          </div>
          <div
            className={cn(
              "flex flex-col",
              !project.actual_end_date && "hidden",
            )}
          >
            <Progress value={100} max={100} className="w-80 bg-destructive" />
            <p
              className={cn(
                "text-xs text-muted-foreground ml-auto mt-1",
                !project.actual_end_date && "hidden",
              )}
            >
              Took{" "}
              {getAutoTimeDifference(
                project.start_date,
                project.actual_end_date,
                "months",
              )}{" "}
              months
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  to={`/${project.id}/update-project`}
                  className="p-2 rounded-md bg-secondary grid place-items-center border-foreground"
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 py-2 rounded-md bg-secondary grid place-items-center border-foreground">
              <Icon name="dots" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
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
        </div>
      </CardContent>
    </Card>
  );
}

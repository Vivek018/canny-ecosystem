import type { ProjectDatabaseRow } from "@canny_ecosystem/supabase/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Avatar, AvatarFallback } from "@canny_ecosystem/ui/avatar";
import { getAutoTimeDifference } from "@canny_ecosystem/utils";
import { DeleteProject } from "./delete-project";

export function ProjectCard({
  project,
}: {
  project: Omit<ProjectDatabaseRow, "created_at" | "company_id">;
}) {
  const avatarName = project?.name
    ?.split(" ")
    .map((name, index) => (index < 2 ? name.charAt(0).toUpperCase() : ""))
    .join("");

  return (
    <Card
      key={project.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-between"
    >
      <CardHeader className="flex flex-row space-y-0 items-start justify-between p-4">
        <Avatar className="rounded-md w-16 h-16">
          {project?.image && (
            <img
              src={project?.image}
              alt={project?.name}
              width={32}
              height={32}
            />
          )}
          <AvatarFallback className="rounded-md">
            <span className="tracking-widest text-[17px] font-medium">
              {avatarName}
            </span>
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-3">
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
                
                <DropdownMenuSeparator />
                <DeleteProject projectId={project.id} />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-4">
        <CardTitle className="text-lg tracking-wide -mt-1.5">
          {project.name}
        </CardTitle>
        <p className="mt-2">{project.description}</p>
      </CardContent>
      <CardFooter
        className={cn(
          "mx-4 mb-1.5 p-0 py-1.5 text-foreground text-sm flex gap-1 justify-between font-semibold",
        )}
      >
        <p
          className={cn(
            "text-green bg-green/25 rounded-md p-1 flex items-center gap-1 capitalize",
          )}
        >
          <Icon name="clock" size="sm" className=" scale-x-[-1]" />
          {getAutoTimeDifference(
            project.starting_date,
            new Date().toISOString(),
          )}{" "}
          days ago
        </p>
        <p
          className={cn(
            "text-destructive bg-destructive/25 rounded-md flex items-center gap-1 p-1 capitalize",
            !getAutoTimeDifference(
              new Date().toISOString(),
              project.ending_date,
            ) && "hidden",
          )}
        >
          <Icon name="clock" size="sm" />
          {getAutoTimeDifference(
            new Date().toISOString(),
            project.ending_date,
          )! > 0
            ? ` In ${getAutoTimeDifference(new Date().toISOString(), project.ending_date)} Days`
            : `${getAutoTimeDifference(
                project.starting_date,
                new Date().toISOString(),
              )} days ago`}
        </p>
      </CardFooter>
    </Card>
  );
}

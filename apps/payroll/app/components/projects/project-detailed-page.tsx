import type { ProjectsWithCompany } from "@canny_ecosystem/supabase/queries";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Card } from "@canny_ecosystem/ui/card";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";
import { ProjectOptionsDropdown } from "./project-options-dropdown";
import { formatDate } from "@canny_ecosystem/utils";
import { Avatar, AvatarFallback } from "@canny_ecosystem/ui/avatar";

export const ProjectDetailedPage = ({
  project,
}: {
  project: Omit<ProjectsWithCompany, "created_at" | "updated_at">;
}) => {
  const companies = [
    project?.project_client,
    project?.primary_contractor,
    project?.end_client,
  ];

  return (
    <div className="w-full mb-4">
      <Card className="my-4 rounded w-full h-full p-4 flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center justify-between">
            <Link
              prefetch="intent"
              to="/projects"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "bg-card",
              )}
            >
              <Icon name="chevron-left" size="sm" className="md:mr-1" />
              <p className="hidden md:flex">Back to Projects</p>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                prefetch="intent"
                to={`/${project.id}/update-project`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <Icon name="edit" size="xs" className="mr-1.5" />
                <p>Edit</p>
              </Link>
              <ProjectOptionsDropdown
                project={{
                  id: project.id,
                  actual_end_date: project.actual_end_date,
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
          <div className="flex flex-col lg:flex-row gap-6">
            <div>
              <div
                className={cn(
                  "rounded-sm flex items-center",
                  ["completed", "active"].includes(project.status) &&
                    "text-green",
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
              <div className="mt-1 flex flex-col items-start">
                <h1 className="text-3xl tracking-wide font-bold">
                  {project.name}
                </h1>
                <div className="flex items-center gap-1.5 -mt-1">
                  <p className="text-[11px] bg-muted w-max text-muted-foreground px-1.5 mt-1.5 rounded">
                    {project.project_code}
                  </p>
                  <p className="text-[11px] bg-muted w-max text-muted-foreground px-1.5 mt-1.5 rounded">
                    {project.project_type}
                  </p>
                </div>
              </div>
              <p className="md:max-w-[90%] mt-4">{project.description}</p>
              <div className="mt-6">
                <h3 className="font-bold text-lg">Companies Involved</h3>
                <div className="flex items-center justify-between gap-4 mt-1">
                  {companies.map((company, index) => (
                    <div
                      key={company?.id + index.toString()}
                      className={cn(
                        "flex w-full bg-card shadow border px-2 py-2 rounded items-center gap-1.5",
                        !company?.id && "hidden",
                      )}
                    >
                      <Avatar
                        className={cn(
                          "w-12 h-12 border border-muted-foreground/30 shadow-sm hover:z-40",
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
                      <p className="font-medium tracking-wide ml-1">
                        {company?.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Card className="py-5 px-5 lg:my-0 w-full rounded">
              <h2 className="text-2xl tracking-wide font-bold pb-1.5 border-b">
                Project Information
              </h2>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="text-sm tracking-tight capitalize">
                    Start Date
                  </h3>
                  <p className="font-bold -mt-1">
                    {formatDate(project.start_date)}
                  </p>
                </div>
                <div className="flex flex-col">
                  {project.actual_end_date ? (
                    <>
                      <h3 className="text-sm tracking-tight capitalize">
                        End Date
                      </h3>
                      <p className="font-bold -mt-1">
                        {formatDate(project.actual_end_date)}
                      </p>
                    </>
                  ) : project.estimated_end_date ? (
                    <>
                      <h3 className="text-sm tracking-tight capitalize">
                        Ending Date
                      </h3>
                      <p className="font-bold -mt-1">
                        {formatDate(project.estimated_end_date)}
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="mt-10">
                <h3 className="font-bold capitalize">Risk Assessment</h3>
                <p className="text-sm">{project.risk_assessment}</p>
              </div>
              <div className="mt-6">
                <h3 className="font-bold capitalize">Quality Standards</h3>
                <p className="text-sm">{project.quality_standards}</p>
              </div>
              <div className="mt-6">
                <h3 className="font-bold capitalize">
                  Health Safety Requirements
                </h3>
                <p className="text-sm">{project.health_safety_requirements}</p>
              </div>
              <div className="mt-6">
                <h3 className="font-bold capitalize">
                  Environmental Considerations
                </h3>
                <p className="text-sm">
                  {project.environmental_considerations}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

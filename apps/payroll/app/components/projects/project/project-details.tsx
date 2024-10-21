import type { ProjectsWithCompany } from "@canny_ecosystem/supabase/queries";
import { Avatar, AvatarFallback } from "@canny_ecosystem/ui/avatar";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export const ProjectDetails = ({
  project,
}: {
  project: Pick<
    ProjectsWithCompany,
    | "name"
    | "project_code"
    | "project_type"
    | "description"
    | "primary_contractor"
    | "project_client"
    | "primary_contractor"
    | "end_client"
  >;
}) => {
  const companies = [
    project?.project_client,
    project?.primary_contractor,
    project?.end_client,
  ];

  return (
    <div className="">
      <div className="mt-1 flex flex-col items-start">
        <h1 className="text-3xl tracking-wide font-bold">{project.name}</h1>
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
              <p className="font-medium tracking-wide ml-1">{company?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import { Link } from "@remix-run/react";
import { Card, CardContent, CardTitle } from "@canny_ecosystem/ui/card";
import type { ProjectsWithCompany } from "@canny_ecosystem/supabase/queries";

export function PayrollProjectCard({ project }: { project: ProjectsWithCompany & { totalSites: number, pendingPayroll: number } }) {
  return (
    <Card
      key={project.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardContent className="flex flex-row items-center p-4">
        {/* Project Details */}
        <div className="flex items-center flex-1 gap-10">
          <CardTitle className="text-xl tracking-wide">
            <Link
              prefetch="intent"
              to={`${project?.id}`}
              className="truncate max-w-96 font-bold text-wrap line-clamp-2 hover:text-primary"
            >
              {project.name}
            </Link>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] bg-muted w-max text-muted-foreground px-1.5 mt-1.5 rounded-md">
                {project.project_type}
              </p>
            </div>
          </CardTitle>
        </div>

        {/* Stats Container */}
        <div className="flex gap-8">
          {/* Total Sites */}
          <div className="flex flex-col items-center justify-center min-w-24">
            <span className="text-sm text-muted-foreground text-center">Total Sites</span>
            <span className="text-lg font-bold">{project.totalSites || 0}</span>
          </div>

          {/* Pending Payroll */}
          <div className="flex flex-col items-center justify-center min-w-24">
            <span className="text-sm text-muted-foreground text-center">Pending Payroll</span>
            <span className="text-lg font-bold">{project.pendingPayroll || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
import type { ProjectDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Card } from "@canny_ecosystem/ui/card";
import { formatDate } from "@canny_ecosystem/utils";

export const ProjectInformationCard = ({
  project,
}: {
  project: Pick<
    ProjectDatabaseRow,
    | "start_date"
    | "actual_end_date"
    | "estimated_end_date"
    | "environmental_considerations"
    | "health_safety_requirements"
    | "quality_standards"
    | "risk_assessment"
  >;
}) => {
  return (
    <Card className="py-5 px-5 lg:my-0 w-max rounded">
      <h2 className="text-2xl tracking-wide font-bold pb-1.5 border-b">
        Project Information
      </h2>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-sm tracking-tight capitalize">Start Date</h3>
          <p className="font-bold -mt-1">{formatDate(project.start_date)}</p>
        </div>
        <div className="flex flex-col">
          {project.actual_end_date ? (
            <>
              <h3 className="text-sm tracking-tight capitalize">End Date</h3>
              <p className="font-bold -mt-1">
                {formatDate(project.actual_end_date)}
              </p>
            </>
          ) : project.estimated_end_date ? (
            <>
              <h3 className="text-sm tracking-tight capitalize">Ending Date</h3>
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
        <h3 className="font-bold capitalize">Health Safety Requirements</h3>
        <p className="text-sm">{project.health_safety_requirements}</p>
      </div>
      <div className="mt-6">
        <h3 className="font-bold capitalize">Environmental Considerations</h3>
        <p className="text-sm">{project.environmental_considerations}</p>
      </div>
    </Card>
  );
};

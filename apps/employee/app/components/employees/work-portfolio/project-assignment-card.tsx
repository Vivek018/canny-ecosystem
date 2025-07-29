import { Card } from "@canny_ecosystem/ui/card";
import type { EmployeeProjectAssignmentDataType } from "@canny_ecosystem/supabase/queries";
import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
};

type EmployeeProjectAssignment = Omit<
  EmployeeProjectAssignmentDataType,
  "created_at" | "updated_at"
>;

export const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col items-start">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p>{value ?? "--"}</p>
    </div>
  );
};

export const EmployeeProjectAssignmentCard = ({
  projectAssignment,
}: {
  projectAssignment: EmployeeProjectAssignment | null;
}) => {
  return (
    <Card className="rounded w-full h-full p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Assigment</h2>
      </div>

      {projectAssignment ? (
        <div className="grid grid-cols-1 max-sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <DetailItem
            label="Project Name"
            value={projectAssignment.sites?.projects?.name}
          />
          <DetailItem
            label="Site Name"
            value={projectAssignment?.sites?.name}
          />
          <DetailItem
            label="Assignment Type"
            value={replaceUnderscore(projectAssignment?.assignment_type)}
          />
          <DetailItem
            label="Position"
            value={replaceUnderscore(projectAssignment?.position)}
          />
          <DetailItem
            label="Skill Level"
            value={replaceUnderscore(projectAssignment?.skill_level)}
          />
          <DetailItem
            label="Start Date"
            value={formatDate(projectAssignment?.start_date)}
          />
          <DetailItem
            label="End Date"
            value={formatDate(projectAssignment?.end_date)}
          />
          <DetailItem
            label="Probation Period"
            value={projectAssignment?.probation_period ? "Yes" : "No"}
          />
          <DetailItem
            label="Probation End Date"
            value={formatDate(projectAssignment?.probation_end_date)}
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p>No project assignment details available.</p>
        </div>
      )}
    </Card>
  );
};

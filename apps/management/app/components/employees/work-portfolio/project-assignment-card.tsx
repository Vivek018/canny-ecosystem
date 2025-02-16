import { Card } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, useParams } from "@remix-run/react";
import type { EmployeeProjectAssignmentDataType } from "@canny_ecosystem/supabase/queries";
import {
  createRole,
  formatDate,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
  formatter?: (value: string) => string;
};

type EmployeeProjectAssignment = Omit<
  EmployeeProjectAssignmentDataType,
  "created_at" | "updated_at"
>;

export const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
  formatter,
}) => {
  const formattedValue = value ? (formatter ? formatter(value) : value) : "--";

  return (
    <div className="flex flex-col items-start">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p>{formattedValue}</p>
    </div>
  );
};

export const EmployeeProjectAssignmentCard = ({
  projectAssignment,
}: {
  projectAssignment: EmployeeProjectAssignment | null;
}) => {
  const { role } = useUser();
  const { employeeId } = useParams();

  return (
    <Card className="rounded w-full h-full p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Assigment</h2>
        <Link
          prefetch="intent"
          to={`/employees/${employeeId}/work-portfolio/update-project-assignment`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "bg-card",
            !hasPermission(
              `${role}`,
              `${updateRole}:${attribute.employeeProjectAssignment}`,
            ) && "hidden",
            !projectAssignment?.employee_id && "hidden",
          )}
        >
          <Icon name="edit" className="mr-2" />
          Edit
        </Link>
        <Link
          prefetch="intent"
          to={`/employees/${employeeId}/work-portfolio/add-project-assignment`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "bg-card",
            !hasPermission(
              `${role}`,
              `${createRole}:${attribute.employeeProjectAssignment}`,
            ) && "hidden",
            projectAssignment?.employee_id && "hidden",
          )}
        >
          <Icon name="plus-circled" className="mr-2" />
          Add
        </Link>
      </div>

      {projectAssignment ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <DetailItem
            label="Project Name"
            value={projectAssignment.project_sites?.projects?.name}
          />
          <DetailItem
            label="Site Name"
            value={projectAssignment?.project_sites?.name}
          />
          <DetailItem
            label={`Supervisor's Emp. Code`}
            value={projectAssignment?.supervisor?.employee_code}
          />
          <DetailItem
            label="Assignment Type"
            value={projectAssignment?.assignment_type}
            formatter={replaceUnderscore}
          />
          <DetailItem
            label="Position"
            value={projectAssignment?.position}
            formatter={replaceUnderscore}
          />
          <DetailItem
            label="Skill Level"
            value={projectAssignment?.skill_level}
            formatter={replaceUnderscore}
          />
          <DetailItem
            label="Start Date"
            value={projectAssignment?.start_date}
            formatter={formatDate}
          />
          <DetailItem
            label="End Date"
            value={projectAssignment?.end_date}
            formatter={formatDate}
          />
          <DetailItem
            label="Probation Period"
            value={projectAssignment?.probation_period ? "Yes" : "No"}
          />
          <DetailItem
            label="Probation End Date"
            value={projectAssignment?.probation_end_date}
            formatter={formatDate}
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

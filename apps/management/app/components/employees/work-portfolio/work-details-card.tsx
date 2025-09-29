import { Card, CardContent, CardHeader } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, useParams } from "@remix-run/react";
import type { EmployeeWorkDetailsDataType } from "@canny_ecosystem/supabase/queries";
import {
  createRole,
  deleteRole,
  formatDate,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteWorkDetail } from "./delete-work-detail";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
};

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

export const EmployeeWorkDetailsCard = ({
  workDetails,
}: {
  workDetails: EmployeeWorkDetailsDataType[];
}) => {
  const { role } = useUser();
  const { employeeId } = useParams();

  return (
    <Card className="rounded w-full h-full p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {workDetails.length ? "Work Details" : "No Work Details Available"}
        </h2>
        <Link
          prefetch="intent"
          to={`/employees/${employeeId}/work-portfolio/add-work-details`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "bg-card",
            !hasPermission(
              `${role}`,
              `${createRole}:${attribute.employeeWorkDetails}`
            ) && "hidden"
          )}
        >
          <Icon name="plus-circled" className="mr-2" />
          Add
        </Link>
      </div>

      {workDetails ? (
        workDetails.map((workDetail) => (
          <Card
            key={workDetail.id}
            className="w-full max-sm:w-11/12 shadow-none select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
          >
            <CardHeader className="flex flex-row space-y-0 items-center justify-end p-4">
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Link
                        prefetch="intent"
                        to={`/employees/${workDetail.employee_id}/work-portfolio/${workDetail.id}/update-work-details`}
                        className={cn(
                          buttonVariants({ variant: "muted" }),
                          "px-2.5 h-min",
                          !hasPermission(
                            role,
                            `${updateRole}:${attribute.employeeWorkDetails}`
                          ) && "hidden"
                        )}
                      >
                        <Icon name="edit" size="xs" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      buttonVariants({ variant: "muted" }),
                      "px-2.5 h-min",
                      !hasPermission(
                        role,
                        `${deleteRole}:${attribute.employeeWorkDetails}`
                      ) && "hidden"
                    )}
                  >
                    <Icon name="dots-vertical" size="xs" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={10} align="end">
                    <DropdownMenuGroup>
                      <DeleteWorkDetail
                        employeeId={workDetail.employee_id}
                        workDetailId={workDetail.id}
                      />
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              <DetailItem
                label="Project Name"
                value={workDetail.sites?.projects?.name}
              />
              <DetailItem label="Site Name" value={workDetail?.sites?.name} />
              <DetailItem
                label="Department"
                value={workDetail?.departments?.name}
              />
              <DetailItem
                label="Employee Code"
                value={workDetail?.employee_code}
              />
              <DetailItem
                label="Assignment Type"
                value={replaceUnderscore(workDetail?.assignment_type)}
              />
              <DetailItem
                label="Position"
                value={replaceUnderscore(workDetail?.position)}
              />
              <DetailItem
                label="Skill Level"
                value={replaceUnderscore(workDetail?.skill_level)}
              />
              <DetailItem
                label="Start Date"
                value={formatDate(workDetail?.start_date)}
              />
              <DetailItem
                label="End Date"
                value={formatDate(workDetail?.end_date)}
              />
              <DetailItem
                label="Probation Period"
                value={workDetail?.probation_period ? "Yes" : "No"}
              />
              <DetailItem
                label="Probation End Date"
                value={formatDate(workDetail?.probation_end_date)}
              />
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8">
          <p>No Work details available.</p>
        </div>
      )}
    </Card>
  );
};

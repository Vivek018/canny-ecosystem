import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { Link } from "@remix-run/react";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import type { EmployeeWorkHistoryDatabaseRow } from "@canny_ecosystem/supabase/types";
import { DeleteWorkHistory } from "./delete-work-history";
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

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col items-start">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p>{value ?? "--"}</p>
    </div>
  );
};

type EmployeeWorkHistory = Omit<
  EmployeeWorkHistoryDatabaseRow,
  "created_at" 
>;

export const WorkHistoryItem = ({
  workHistory,
}: {
  workHistory: EmployeeWorkHistory;
}) => {
  const { role } = useUser();
  return (
    <Card
      key={workHistory.id}
      className="w-[420px] shadow-none select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">
          {replaceUnderscore(workHistory.position ?? "--")}
        </CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`/employees/${workHistory.employee_id}/work-portfolio/${workHistory.id}/update-work-history`}
                  className={cn(
                    buttonVariants({ variant: "muted" }),
                    "px-2.5 h-min",
                    !hasPermission(
                      `${role}`,
                      `${updateRole}:${attribute.employeeWorkHistory}`,
                    ) && "hidden",
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
                "px-2.5 h-min hidden",
                hasPermission(
                  `${role}`,
                  `${deleteRole}:${attribute.employeeWorkHistory}`,
                ) && "flex",
              )}
            >
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DeleteWorkHistory
                  employeeId={workHistory.employee_id}
                  workHistoryId={workHistory.id}
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-between gap-4 px-4">
        <DetailItem label="company name" value={workHistory.company_name} />
        <div className="flex flex-col items-start">
          <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
            responsibilities
          </h3>
          <p className="line-clamp-4 text-sm">{workHistory.responsibilities}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <DetailItem
            label="start date"
            value={formatDate(workHistory.start_date)}
          />
          <DetailItem
            label="end date"
            value={formatDate(workHistory.end_date)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export const EmployeeWorkHistoriesCard = ({
  employeeWorkHistories,
}: {
  employeeWorkHistories: EmployeeWorkHistory[] | null;
}) => {
  const { role } = useUser();
  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Work History</h2>
        <div>
          <Link
            to="add-work-history"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "bg-card",
              !hasPermission(
                `${role}`,
                `${createRole}:${attribute.employeeWorkHistory}`,
              ) && "hidden",
            )}
          >
            <Icon name="plus-circled" className="mr-2" />
            Add
          </Link>
        </div>
      </div>

      <div className="w-full overflow-scroll no-scrollbar">
        {employeeWorkHistories?.length ? (
          <div className="flex items-center gap-4 min-w-max">
            {employeeWorkHistories.map((workHistory, index) => (
              <WorkHistoryItem
                key={workHistory?.id + index.toString()}
                workHistory={workHistory}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No employee work history available.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

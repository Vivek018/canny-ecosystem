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
  deleteRole,
  formatDate,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUserRole } from "@/utils/user";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
  formatter?: (date: string | Date) => string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, formatter }) => {
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

type EmployeeWorkHistory = Omit<
  EmployeeWorkHistoryDatabaseRow,
  "created_at" | "updated_at"
>;

export const WorkHistoryItem = ({
  workHistory,
}: {
  workHistory: EmployeeWorkHistory;
}) => {
  const { role } = useUserRole();
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
                      `${updateRole}:employee_work_history`
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
                "px-2.5 h-min hidden",
                hasPermission(
                  `${role}`,
                  `${deleteRole}:employee_work_history`
                ) && "flex"
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
            value={workHistory.start_date}
            formatter={formatDate}
          />
          <DetailItem
            label="end date"
            value={workHistory.end_date}
            formatter={formatDate}
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
  const { role } = useUserRole();
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
                `${updateRole}:employee_work_history`
              ) && "hidden"
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

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
import type { EmployeeGuardianDatabaseRow } from "@canny_ecosystem/supabase/types";
import { DeleteGuardian } from "./delete-guardian";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
  formatter?: (value: string) => string;
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

type EmployeeGuardian = Omit<
  EmployeeGuardianDatabaseRow,
  "created_at" | "updated_at"
>;

export const GuardianItem = ({ guardian }: { guardian: EmployeeGuardian }) => {
  return (
    <Card
      key={guardian.id}
      className="w-[420px] shadow-none select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">
          {guardian.relationship ?? "--"}
        </CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`/employees/${guardian.employee_id}/${guardian.id}/update-employee-guardian`}
                  className={cn(
                    buttonVariants({ variant: "muted" }),
                    "px-2.5 h-min",
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
              )}
            >
              <Icon name="dots" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DeleteGuardian
                  employeeId={guardian.employee_id}
                  guardianId={guardian.id}
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col px-4 pt-1 pb-4 gap-3">
        <div className="flex flex-row items-center justify-between">
          <DetailItem
            label="Name"
            value={`${guardian.first_name ?? "--"} ${guardian.last_name ?? "--"}`}
          />
          <DetailItem label="Date of Birth" value={guardian.date_of_birth} />
          <DetailItem label="Gender" value={guardian.gender} />
        </div>
        <div className="flex flex-row items-center justify-between">
          <DetailItem label="Mobile Number" value={guardian.mobile_number} />
          <DetailItem
            label="Alternate Number"
            value={guardian.alternate_mobile_number}
          />
        </div>
        <div className="mt-1.5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Icon
              name={guardian.is_emergency_contact ? "check" : "cross"}
              size="sm"
              className={cn(
                "dark:mt-[1px]",
                guardian.is_emergency_contact
                  ? "text-green"
                  : "text-destructive",
              )}
            />
            <p>Is emergency contact</p>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Icon
              name={guardian.address_same_as_employee ? "check" : "cross"}
              size="sm"
              className={cn(
                "dark:mt-[1px]",
                guardian.address_same_as_employee
                  ? "text-green"
                  : "text-destructive",
              )}
            />
            <p>Address same as employee</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const EmployeeGuardiansCard = ({
  employeeGuardians,
}: {
  employeeGuardians: EmployeeGuardian[] | null;
}) => {
  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Guardians Details</h2>
        <div>
          <Link
            to="add-employee-guardian"
            className={cn(buttonVariants({ variant: "outline" }), "bg-card")}
          >
            <Icon name="plus-circled" className="mr-2" />
            Add
          </Link>
        </div>
      </div>

      <div className="w-full overflow-scroll no-scrollbar">
        {employeeGuardians ? (
          <div className="flex items-center gap-4 min-w-max">
            {employeeGuardians.map((guardian, index) => (
              <GuardianItem
                key={guardian?.id + index.toString()}
                guardian={guardian}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No guardians details available.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

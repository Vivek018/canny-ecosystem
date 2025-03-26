import type { TransformedAttendanceDataType } from "@/routes/_protected+/time-tracking+/attendance+/_index";
import { useUser } from "@/utils/user";
import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, extractKeys, hasPermission } from "@canny_ecosystem/utils";
import {
  attribute,
  modalSearchParamNames,
} from "@canny_ecosystem/utils/constant";
import { useSearchParams, useSubmit } from "@remix-run/react";
import { AttendanceRegister } from "./attendance-register";
import type {
  CompanyDatabaseRow,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { AttendanceHourlyRegister } from "./attendance-hourly-register";

export function AttendanceMenu({
  selectedRows,
  companyName,
  companyAddress,
}: {
  selectedRows: TransformedAttendanceDataType[];
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
}) {
  const { role } = useUser();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  console.log(selectedRows);

  const handleCreatePayroll = () => {
    // submit(
    //   {
    //     type: "salary",
    //     attendanceData: JSON.stringify(attendanceForPayroll),
    //     totalEmployees,
    //     totalNetAmount,
    //     failedRedirect: "/time-tracking/attendance",
    //   },
    //   {
    //     method: "POST",
    //     action: "/create-payroll",
    //   },
    // );
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={
          selectedRows?.length ? "bg-muted/70 text-muted-foreground" : undefined
        }
      >
        <Button variant="outline" size="icon" className="h-10 w-[2.5rem]">
          <Icon name="plus" className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
        <div className={cn("flex flex-col", !selectedRows?.length && "hidden")}>
          <DropdownMenuItem
            onClick={handleCreatePayroll}
            className={cn(
              buttonVariants({ variant: "muted" }),
              "w-full justify-start text-[13px] h-9 px-2 gap-2",
              !hasPermission(role, `${createRole}:${attribute.payroll}`) &&
              "hidden",
            )}
          >
            <Icon name="plus-circled" />
            <span>Create Payroll</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              !hasPermission(role, `${createRole}:${attribute.attendance}`) &&
              "hidden",
              !selectedRows.length && "hidden"
            )}
          />
          <div className={cn("flex flex-col gap-1", !selectedRows?.length && "hidden")}>
          <AttendanceRegister
            selectedRows={selectedRows}
            companyName={companyName}
            companyAddress={companyAddress}
          />
          <AttendanceHourlyRegister
            selectedRows={selectedRows}
            companyName={companyName}
            companyAddress={companyAddress}
          />
          </div>
        </div>
        <DropdownMenuSeparator
          className={cn(
            !hasPermission(role, `${createRole}:${attribute.attendance}`) &&
            "hidden",
            !selectedRows.length && "hidden"
          )}
        />
        <DropdownMenuItem
          onClick={() => {
            searchParams.set(
              "step",
              modalSearchParamNames.import_employee_attendance
            );
            setSearchParams(searchParams);
          }}
          className={cn(
            "space-x-2 flex items-center",
            !hasPermission(role, `${createRole}:${attribute.attendance}`) &&
            "hidden"
          )}
        >
          <Icon name="import" size="sm" className="mb-0.5" />
          <span>Import Attendance</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

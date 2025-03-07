import type { TransformedAttendanceDataType } from "@/routes/_protected+/time-tracking+/attendance+/_index";
import { useUser } from "@/utils/user";
import { Button } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import {
  attribute,
  modalSearchParamNames,
} from "@canny_ecosystem/utils/constant";
import { useSearchParams } from "@remix-run/react";
import { AttendanceRegister } from "./attendance-register";
import type { CompanyDatabaseRow, LocationDatabaseRow } from "@canny_ecosystem/supabase/types";

export function ImportAttendanceMenu({
  selectedRows,
  companyName,
  companyAddress,
}: {
  selectedRows: TransformedAttendanceDataType[];
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
}) {
  const { role } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-[2.5rem]">
          <Icon name="plus" className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
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
        <DropdownMenuSeparator
          className={cn(
            !hasPermission(role, `${createRole}:${attribute.attendance}`) &&
              "hidden",
            !selectedRows.length && "hidden"
          )}
        />
        <AttendanceRegister
          selectedRows={selectedRows}
          companyName={companyName}
          companyAddress={companyAddress}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

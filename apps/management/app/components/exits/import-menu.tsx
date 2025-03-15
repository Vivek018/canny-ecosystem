import { useUser } from "@/utils/user";
import type { ExitDataType } from "@canny_ecosystem/supabase/queries";
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
import { createRole, extractKeys, hasPermission } from "@canny_ecosystem/utils";
import {
  attribute,
  modalSearchParamNames,
} from "@canny_ecosystem/utils/constant";
import { useSearchParams, useSubmit } from "@remix-run/react";

export function ImportExitMenu({ selectedRows, className }: { selectedRows: ExitDataType[]; className?: string }) {
  const { role } = useUser();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  const exitForPayroll = extractKeys(selectedRows, [
    "id",
    "employee_id",
    "net_pay"
  ]);

  const totalEmployees = exitForPayroll?.length;
  const totalNetAmount = exitForPayroll?.reduce((sum, item) => sum + item?.net_pay, 0);

  const handleCreatePayroll = () => {
    submit(
      {
        type: "exit",
        exitData: JSON.stringify(exitForPayroll),
        totalEmployees,
        totalNetAmount,
        failedRedirect: "/approvals/exits",
      },
      {
        method: "POST",
        action: "/create-payroll",
      },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={cn(
          !hasPermission(role, `${createRole}:${attribute.exits}`) && "hidden", className,
        )}
      >
        <Button variant="outline" size="icon" className="h-10 w-[2.5rem]">
          <Icon name="plus" className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuItem
          onClick={handleCreatePayroll}
          className={cn(
            "space-x-2 flex items-center bg-muted/70 text-muted-foreground",
            !hasPermission(role, `${createRole}:${attribute.payroll}`) &&
            "hidden",
            !selectedRows.length && "hidden",
          )}
        >
          <Icon name="plus-circled" size="sm" />
          <span>Create Payroll</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className={cn("flex", !selectedRows.length && "hidden")} />
        <DropdownMenuItem
          onClick={() => {
            searchParams.set("step", modalSearchParamNames.import_exits);
            setSearchParams(searchParams);
          }}
          className="space-x-2 flex items-center"
        >
          <Icon name="import" size="sm" className="mb-0.5" />
          <span>Import/backfill</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

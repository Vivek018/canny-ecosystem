import { useLeavesStore } from "@/store/leaves";
import { useUser } from "@/utils/user";
import type {
  CompanyDatabaseRow,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";
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
import { LeavesRegister } from "./leaves-register";

export function ImportLeavesMenu({
  companyAddress,
  companyName,
}: {
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
}) {
  const { role } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedRows } = useLeavesStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={cn(
          !hasPermission(role, `${createRole}:${attribute.leaves}`) && "hidden"
        )}
      >
        <Button variant="outline" size="icon" className="h-10 w-[2.5rem]">
          <Icon name="plus" className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuItem
          onClick={() => {
            searchParams.set("step", modalSearchParamNames.import_leaves);
            setSearchParams(searchParams);
          }}
          className="space-x-2 flex items-center"
        >
          <Icon name="import" size="sm" className="mb-0.5" />
          <span>Import/backfill</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator
          className={cn(
            !hasPermission(role, `${createRole}:${attribute.leaves}`) &&
              "hidden",
            !selectedRows.length && "hidden"
          )}
        />
        <LeavesRegister
          selectedRows={selectedRows}
          companyName={companyName}
          companyAddress={companyAddress}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

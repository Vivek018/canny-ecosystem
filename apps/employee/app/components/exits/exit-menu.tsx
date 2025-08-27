import { useUser } from "@/utils/user";
import type { ExitDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { DownloadBankAdvice } from "./download-bank-advice";

export function ExitMenu({
  selectedRows,
  className,
  env,
}: {
  selectedRows: ExitDataType[];
  env: any;
  className?: string;
}) {
  const { role } = useUser();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className={cn(
            !hasPermission(role, `${createRole}:${attribute.exits}`) &&
              "hidden",
            className
          )}
        >
          <Button variant="outline" size="icon" className="h-10 w-[2.5rem]">
            <Icon name="dots-vertical" className="h-[18px] w-[18px]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={10} align="end">
          <Button variant={"ghost"} className="w-full px-2">
            <DownloadBankAdvice env={env} data={selectedRows} />
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

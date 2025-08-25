import { useUser } from "@/utils/user";
import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useNavigate } from "@remix-run/react";
import { DownloadBankAdvice } from "./download-bank-advice";

export function ReimbursementMenu({
  selectedRows,
  className,
  env,
}: {
  selectedRows: ReimbursementDataType[];
  className?: string;
  env: any;
}) {
  const { role } = useUser();
  const navigate = useNavigate();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className={cn(
            !hasPermission(role, `${createRole}:${attribute.reimbursements}`) &&
              "hidden",
            className
          )}
        >
          <Button variant="outline" size="icon" className="h-10 w-[2.5rem]">
            <Icon name="dots-vertical" className="h-[18px] w-[18px]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={10} align="end">
          <div>
            <Button
              variant={"ghost"}
              className={cn("px-2 w-full flex flex-row justify-start gap-2 ")}
              onClick={() =>
                navigate("/approvals/reimbursements/create-invoice")
              }
            >
              <Icon name="plus-circled" />
              Create Invoice
            </Button>
          </div>
          <DropdownMenuSeparator />
          <Button variant={"ghost"} className="w-full px-2">
            <DownloadBankAdvice env={env} data={selectedRows} />
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

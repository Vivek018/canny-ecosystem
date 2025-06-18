import { useUser } from "@/utils/user";
import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, extractKeys, hasPermission } from "@canny_ecosystem/utils";
import {
  attribute,
  modalSearchParamNames,
} from "@canny_ecosystem/utils/constant";
import { useSearchParams, useSubmit } from "@remix-run/react";
import { useState } from "react";

export function ReimbursementMenu({
  selectedRows,
  className,
}: {
  selectedRows: ReimbursementDataType[];
  className?: string;
}) {
  const { role } = useUser();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  const [enterTitle, setEnterTitle] = useState(false);
  const [title, setTitle] = useState("");

  const reimbursementForPayroll = extractKeys(selectedRows, [
    "id",
    "employee_id",
    "amount",
  ]);

  const totalEmployees = reimbursementForPayroll?.length;
  const totalNetAmount = reimbursementForPayroll?.reduce(
    (sum, item) => sum + item?.amount,
    0
  );

  const handleCreatePayroll = (title: string) => {
    submit(
      {
        title: title,
        type: "reimbursement",
        reimbursementData: JSON.stringify(reimbursementForPayroll),
        totalEmployees,
        totalNetAmount,
        failedRedirect: "/approvals/reimbursements",
      },
      {
        method: "POST",
        action: "/create-payroll",
      }
    );
  };

  return (
    <>
      {enterTitle && (
        <Dialog open={enterTitle} onOpenChange={setEnterTitle}>
          <DialogContent>
            <DialogHeader className="mb-2">
              <DialogTitle>Add a Title for Payroll</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Enter the title here"
              onChange={(e) => setTitle(e.target.value)}
            />
            <DialogFooter className="mt-2">
              <DialogClose
                className={buttonVariants({ variant: "secondary" })}
                onClick={() => setEnterTitle(false)}
              >
                Cancel
              </DialogClose>
              <Button
                onClick={() => {
                  handleCreatePayroll(title);
                  setEnterTitle(false);
                }}
              >
                Create Payroll
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
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
            <Icon name="plus" className="h-[18px] w-[18px]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={10} align="end">
          <DropdownMenuItem
            onClick={() => setEnterTitle(true)}
            className={cn(
              "space-x-2 flex items-center bg-muted/70 text-muted-foreground",
              !hasPermission(role, `${createRole}:${attribute.payroll}`) &&
                "hidden",
              !selectedRows.length && "hidden"
            )}
          >
            <Icon name="plus-circled" size="sm" />
            <span>Create Payroll</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn("flex", !selectedRows.length && "hidden")}
          />
          <DropdownMenuItem
            onClick={() => {
              searchParams.set(
                "step",
                modalSearchParamNames.import_reimbursement
              );
              setSearchParams(searchParams);
            }}
            className="space-x-2 flex items-center"
          >
            <Icon name="import" size="sm" className="mb-0.5" />
            <span>Import/backfill</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

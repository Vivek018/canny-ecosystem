import type { ReimbursementRow } from "@canny_ecosystem/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { replaceDash } from "@canny_ecosystem/utils";
import { useNavigate, useSubmit } from "@remix-run/react";

export const PayrollEntryDropdown = ({
  data,
  triggerChild,
  status,
  type,
}: {
  status: string;
  data: Omit<ReimbursementRow, "created_at" | "updated_at">;
  triggerChild: React.ReactElement;
  type: string;
}) => {
  const navigate = useNavigate();

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    document: string
  ) => {
    e.preventDefault();
    navigate(`${data?.payroll_id}/${data?.employee_id}/${document}`);
  };

  const employeeDocuments = ["salary-slip"];

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent align="end">
        <DropdownMenuGroup className={cn(status === "pending" && "hidden")}>
          {employeeDocuments.map((document) => (
            <DropdownMenuItem
              key={document}
              onClick={(e) => handleClick(e, document)}
            >
              Preview {`${replaceDash(document)}`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator
          className={cn(status === "pending" && "hidden")}
        />
        <DropdownMenuGroup>
          <DeletePayrollEntry
            payrollId={data?.payroll_id!}
            id={data?.id}
            type={type}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const DeletePayrollEntry = ({
  payrollId,
  id,
  type,
}: {
  payrollId: string;
  id: string;
  type: string;
}) => {
  const submit = useSubmit();

  const handleDelete = () => {
    submit(
      {
        type: type,
        is_active: false,
        returnTo: `/payroll/run-payroll/${payrollId}`,
      },
      {
        method: "POST",
        action: `/payroll/run-payroll/${payrollId}/${id}/delete-payroll-entry`,
      }
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "destructive-ghost", size: "full" }),
          "text-[13px] h-9"
        )}
      >
        Delete Payroll Entry
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            payroll entry and remove it's data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={handleDelete}
            onSelect={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

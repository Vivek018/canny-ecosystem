
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

export const SalaryEntryDropdown = ({
  data,
  triggerChild,
}: {
  data: any;
  triggerChild: React.ReactElement;
}) => {
  const navigate = useNavigate();

  const payrollId = data?.salary_entries.payroll_id;
  const employeeId = data?.employee.id;

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    document: string
  ) => {
    e.preventDefault();
    navigate(`${employeeId}/${document}`);
  };

  const employeeDocuments = ["salary-slip"];

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {employeeDocuments.map((document) => (
            <DropdownMenuItem
              key={document}
              onClick={(e) => handleClick(e, document)}
            >
              Preview {`${replaceDash(document)}`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DeleteSalaryEntry payrollId={payrollId} employeeId={employeeId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const DeleteSalaryEntry = ({
  payrollId,
  employeeId,
}: {
  payrollId: string;
  employeeId: string;
}) => {
  const submit = useSubmit();

  const handleDelete = () => {
    submit(
      {
        is_active: false,
        returnTo: `/payroll/run-payroll/${payrollId}`,
      },
      {
        method: "POST",
        action: `/payroll/run-payroll/${payrollId}/${employeeId}/delete-salary-entry`,
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
        Delete Salary Entry
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            salary entry and remove it's data from our servers.
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

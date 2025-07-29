import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import Papa from "papaparse";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@canny_ecosystem/ui/dialog";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { emailRole, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { UserEmailSelect } from "./email/user-email-select";
import { useUser } from "@/utils/user";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";
import type { EmployeeDataType } from "@canny_ecosystem/supabase/queries";
import { employeeColumnIdArray } from "./table/data-table-header";

export default function EmployeesEmailMenu({
  selectedRows,
  emails,
  columnVisibility,
}: {
  selectedRows: any[];
  emails: any[];
  columnVisibility: any;
}) {
  const userEmails = emails.map((item) => item.email);

  const { role } = useUser();
  const [to, setTo] = useState<string[]>();

  const submit = useSubmit();

  const toBeExportedData = selectedRows.map((element) => {
    const exportedData: {
      [key: (typeof employeeColumnIdArray)[number]]: string | number | boolean;
    } = {};

    for (const key of employeeColumnIdArray) {
      if (columnVisibility[key] === false) {
        continue;
      }
      if (key === "employee_code") {
        exportedData[key] = element?.employee_code;
      } else if (key === "full_name") {
        exportedData[key] =
          `${element?.first_name} ${element?.middle_name} ${element?.last_name}`;
      } else if (key === "mobile_number") {
        exportedData[key] = element?.primary_mobile_number;
      } else if (key === "date_of_birth") {
        exportedData[key] = element?.date_of_birth;
      } else if (key === "education") {
        exportedData[key] = element?.education ?? "";
      } else if (key === "gender") {
        exportedData[key] = element?.gender;
      } else if (key === "status") {
        exportedData[key] = element?.is_active ? "Active" : "Inactive";
      } else if (key === "project_name") {
        exportedData[key] =
          element?.employee_project_assignment?.sites?.projects?.name;
      } else if (key === "site_name") {
        exportedData[key] = element?.employee_project_assignment?.sites?.name;
      } else if (key === "assignment_type") {
        exportedData[key] =
          element?.employee_project_assignment?.assignment_type ?? "";
      } else if (key === "position") {
        exportedData[key] = element?.employee_project_assignment?.position!;
      } else if (key === "skill_level") {
        exportedData[key] =
          element?.employee_project_assignment?.skill_level ?? "";
      } else if (key === "start_date") {
        exportedData[key] = element?.employee_project_assignment?.start_date!;
      } else if (key === "end_date") {
        exportedData[key] =
          element?.employee_project_assignment?.end_date ?? "";
      } else {
        exportedData[key] = element[key as keyof EmployeeDataType] as
          | string
          | boolean
          | number;
      }
    }

    return exportedData;
  });
  const handleEmail = async () => {
    const employeeFile = Papa.unparse(toBeExportedData);
    submit({ employeeFile, to } as unknown as string, {
      method: "post",
      action: "/employees/send-email",
      replace: true,
    });
  };

  return (
    <div
      className={cn(
        !hasPermission(role, `${emailRole}:${attribute.employees}`) && "hidden",
        !selectedRows.length && "hidden"
      )}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 bg-muted/70 text-muted-foreground"
          >
            <Icon name="email" size="md" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="mb-2">
            <DialogTitle>Email Employees Data</DialogTitle>
            <DialogDescription>Send email of Employees data</DialogDescription>
          </DialogHeader>
          <UserEmailSelect to={to} options={userEmails} setTo={setTo} />
          <DialogFooter className="mt-2">
            <DialogClose className={buttonVariants({ variant: "secondary" })}>
              Cancel
            </DialogClose>
            <Button
              onClick={() => handleEmail()}
              disabled={to?.length === 0 || to?.length === undefined}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

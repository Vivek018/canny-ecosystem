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
import { FilesSelect } from "./email/files-select";
import { useUser } from "@/utils/user";
import { prepareAttendanceWorkbook } from "./attendance-register";
import { createAttendanceHourlyWorkbook } from "./attendance-hourly-register";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";
import type {
  CompanyDatabaseRow,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";

export default function AttendanceEmailMenu({
  selectedRows,
  companyName,
  companyAddress,
  emails,
  columnVisibility,
}: {
  selectedRows: any[];
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
  emails: any[];
  columnVisibility: any;
}) {
  const userEmails = emails.map((item) => item?.email);

  const { role } = useUser();
  const [to, setTo] = useState<string[]>();
  const [files, setFiles] = useState<string[]>();
  const submit = useSubmit();

  const allHeaders = new Set<string>();
  const dateHeaders = new Set<string>();
  for (const entry of selectedRows) {
    for (const key of Object.keys(entry)) {
      if (columnVisibility[key] !== false) {
        allHeaders.add(key);
        if (
          ![
            "employee_id",
            "employee_code",
            "employee_name",
            "project",
            "project_site",
          ].includes(key)
        ) {
          dateHeaders.add(key);
        }
      }
    }
  }

  const sortedDateHeaders = [...dateHeaders].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const formattedData: any[] | Papa.UnparseObject<any> = [];

  for (const entry of selectedRows) {
    const {
      employee_id,
      employee_code,
      employee_name,
      project,
      project_site,
      ...attendance
    } = entry;

    const fixedFields = { employee_code, employee_name, project, project_site };

    const formattedEntry: Record<string, string> = { ...fixedFields };

    for (const date of sortedDateHeaders) {
      const dayData = attendance[date];
      formattedEntry[date] = dayData ? `${dayData.present}` : "";
    }

    formattedData.push(formattedEntry);
  }

  function arrayBufferToBase64(buffer: any) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  const handleEmail = async () => {
    const attendanceCSVFile = Papa.unparse(formattedData);

    const attendanceRegisterFile = await prepareAttendanceWorkbook({
      selectedRows,
      companyName,
      companyAddress,
    });

    const attendanceHourlyRegisterFile = await createAttendanceHourlyWorkbook({
      selectedRows,
      companyName,
      companyAddress,
    });

    const attendanceRegisterBase64 = arrayBufferToBase64(
      attendanceRegisterFile
    );
    const attendanceHourlyRegisterBase64 = arrayBufferToBase64(
      attendanceHourlyRegisterFile
    );

    const formData = new FormData();
    formData.append("attendanceCSVFile", attendanceCSVFile);
    formData.append("attendanceRegisterBase64", attendanceRegisterBase64);
    formData.append(
      "attendanceHourlyRegisterBase64",
      attendanceHourlyRegisterBase64
    );

    if (to) {
      formData.append("to", to.join(","));
    }

    if (files) {
      formData.append("files", files.join(","));
    }

    submit(formData, {
      method: "post",
      action: "/time-tracking/attendance/send-email",
      replace: true,
    });
  };

  return (
    <div
      className={cn(
        !hasPermission(role, `${emailRole}:${attribute.attendance}`) &&
          "hidden",
        !selectedRows.length && "hidden"
      )}
    >
      <Dialog>
        <DialogTrigger asChild className="">
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
            <DialogTitle>Email Attendance Data</DialogTitle>
            <DialogDescription>Send email of Attendance data</DialogDescription>
          </DialogHeader>
          <UserEmailSelect options={userEmails} setTo={setTo} to={to} />
          <FilesSelect setFiles={setFiles} files={files} />

          <DialogFooter className="mt-2">
            <DialogClose className={buttonVariants({ variant: "secondary" })}>
              Cancel
            </DialogClose>
            <Button
              onClick={() => handleEmail()}
              disabled={
                to?.length === 0 ||
                to?.length === undefined ||
                files?.length === 0 ||
                files?.length === undefined
              }
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

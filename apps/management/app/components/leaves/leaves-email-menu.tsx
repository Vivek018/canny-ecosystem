import { Button } from "@canny_ecosystem/ui/button";
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
import { useSearchParams, useSubmit } from "@remix-run/react";
import { useState } from "react";
import type {
  CompanyDatabaseRow,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { LeavesColumnIdArray } from "./table/leaves-table-header";
import type { LeavesDataType } from "@canny_ecosystem/supabase/queries";
import { prepareLeavesWorkbook } from "./leaves-register";

export default function LeavesEmailMenu({
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
  const userEmails = emails.map((item) => item.email);

  const [searchParams] = useSearchParams();
  const refYear = Number(searchParams.get("year"));
  const { role } = useUser();
  const [to, setTo] = useState<string[]>();
  const [files, setFiles] = useState<string[]>();
  const submit = useSubmit();

  const toBeExportedData = selectedRows.map((element) => {
    const exportedData: {
      [key: (typeof LeavesColumnIdArray)[number]]: string | number | boolean;
    } = {};

    for (const key of LeavesColumnIdArray) {
      if (columnVisibility[key] === false) {
        continue;
      }
      if (key === "employee_code") {
        exportedData[key] = element?.employees?.employee_code;
      } else if (key === "employee_name") {
        exportedData[
          key
        ] = `${element?.employees?.first_name} ${element?.employees?.middle_name} ${element?.employees?.last_name}`;
      } else if (key === "email") {
        exportedData[key] = element?.users?.email ?? "";
      } else if (key === "project") {
        exportedData[key] =
          element?.employees?.employee_project_assignment?.project_sites?.projects?.name;
      } else if (key === "project_site") {
        exportedData[key] =
          element?.employees?.employee_project_assignment?.project_sites?.name;
      } else {
        exportedData[key] = element?.[key as keyof LeavesDataType] as
          | string
          | boolean
          | number;
      }
    }

    return exportedData;
  });

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
    const leavesCSVFile = Papa.unparse(toBeExportedData);
    const leavesRegisterFile = await prepareLeavesWorkbook({
      selectedRows,
      companyName,
      companyAddress,
      refYear,
    });

    const leavesRegisterBase64 = arrayBufferToBase64(leavesRegisterFile);

    const formData = new FormData();
    formData.append("leavesCSVFile", leavesCSVFile);
    formData.append("leavesRegisterBase64", leavesRegisterBase64);

    if (to) {
      formData.append("to", to.join(","));
    }

    if (files) {
      formData.append("files", files.join(","));
    }

    submit(formData, {
      method: "post",
      action: "/time-tracking/leaves/send-email",
      replace: true,
    });
  };

  return (
    <div
      className={cn(
        !hasPermission(role, `${emailRole}:${attribute.leaves}`) && "hidden",
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
            <DialogTitle>Email Leaves Data</DialogTitle>
            <DialogDescription>Send email of Leaves data</DialogDescription>
          </DialogHeader>
          <UserEmailSelect options={userEmails} setTo={setTo} to={to} />
          <FilesSelect setFiles={setFiles} files={files} />

          <DialogFooter className="mt-2">
            <DialogClose className="border px-2 rounded-sm bg-muted text-sm hover:bg-muted/90">
              Cancel
            </DialogClose>
            <Button
              variant={"default"}
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

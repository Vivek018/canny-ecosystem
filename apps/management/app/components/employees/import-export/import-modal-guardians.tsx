import { Button } from "@canny_ecosystem/ui/button";
import Papa from "papaparse";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { SIZE_1KB, SIZE_1MB } from "@canny_ecosystem/utils";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useState, useEffect } from "react";

export const ImportEmployeeGuardiansModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [eligibleFileSize, setEligibleFileSize] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const navigate = useNavigate();

  const MAX_FILE_SIZE_LIMIT = SIZE_1MB * 3;

  const isOpen =
    searchParams.get("step") ===
    modalSearchParamNames.import_employee_guardians;

  const onClose = () => {
    searchParams.delete("step");
    setSearchParams(searchParams);
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(undefined);
      setEligibleFileSize(true);
    }
  }, [isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setSelectedFile(file);
      setEligibleFileSize(file.size <= MAX_FILE_SIZE_LIMIT);
    } else {
      setSelectedFile(undefined);
      setEligibleFileSize(true);
    }
  };

  const handleFileSubmit = () => {
    if (eligibleFileSize && selectedFile) {
      navigate("/employees/import-guardians", {
        state: { file: selectedFile },
      });
    }
  };

  const formatFileSize = (size: number) => {
    if (size < SIZE_1KB) return `${size} Bytes`;
    if (size < SIZE_1MB) return `${(size / SIZE_1KB).toFixed(2)} KB`;
    return `${(size / SIZE_1MB).toFixed(2)} MB`;
  };

  const demo: any[] | Papa.UnparseObject<any> = [
    {
      employee_code: null,
      first_name: null,
      last_name: null,
      relationship: null,
      date_of_birth: null,
      gender: null,
      email: null,
      mobile_number: null,
      alternate_mobile_number: null,
      is_emergency_contact: null,
      address_same_as_employee: null,
    },
  ];
  const downloadDemoCsv = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const csv = Papa.unparse(demo);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;

    link.setAttribute("download", "Employee-Guardians-Format");

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Choose the file to be imported</DialogTitle>
        <div className="flex justify-between">
          <DialogDescription className="text-muted-foreground">
            Only .csv format is supported! 
            <span
              className="text-primary cursor-pointer ml-2"
              onClick={downloadDemoCsv}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  downloadDemoCsv(
                    e as unknown as React.MouseEvent<
                      HTMLButtonElement,
                      MouseEvent
                    >
                  );
                }
              }}
            >
              download csv format
            </span>
            <br />
            Maximum upload size is 3MB!
          </DialogDescription>
          <div className="flex flex-col justify-end">
            <Button
              className={cn(selectedFile ? "flex" : "hidden")}
              onClick={handleFileSubmit}
              disabled={!eligibleFileSize}
            >
              Confirm file
            </Button>
          </div>
        </div>

        <Input type="file" accept=".csv" onChange={handleFileSelect} />

        <p
          className={cn(
            "text-sm",
            selectedFile ? "flex" : "hidden",
            !eligibleFileSize ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {!eligibleFileSize
            ? "File size exceeds the 3MB limit"
            : `Your file size: ${formatFileSize(selectedFile?.size ?? 0)}`}
        </p>
      </DialogContent>
    </Dialog>
  );
};

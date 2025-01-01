import { Button } from "@canny_ecosystem/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { Input } from "@canny_ecosystem/ui/input";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useState } from "react";

export const ImportReimbursementModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [eligibleFileSize, setEligibleFileSize] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const navigate = useNavigate();

  const MAX_FILE_SIZE_LIMIT = 3145728;

  const isOpen =
    searchParams.get("step") === modalSearchParamNames.import_reimbursement;

  const onClose = () => {
    searchParams.delete("step");
    setSearchParams(searchParams);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files![0];
    if (file) {
      setSelectedFile(file);
      if (file.size > MAX_FILE_SIZE_LIMIT) {
        setEligibleFileSize(false);
        alert("File size exceeds the 3MB limit");
      } else {
        setEligibleFileSize(true);
      }
    }
  };

  const handleFileSubmit = () => {
    if (eligibleFileSize) {
      navigate("/approvals/reimbursements/import-data", {
        state: { file: selectedFile },
      });
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} Bytes`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Choose the file to be imported</DialogTitle>
        <div className="flex justify-between">
          <DialogDescription className="text-muted-foreground">
            only .csv format supported! <br />
            maximum upload size is 3MB!
          </DialogDescription>
          <Button
            className={selectedFile ? "flex" : "hidden"}
            onClick={handleFileSubmit}
          >
            Confirm file
          </Button>
        </div>

        <Input type="file" accept=".csv" onChange={handleFileSelect} />

        <p
          className={
            selectedFile ? "flex text-sm text-muted-foreground" : "hidden"
          }
        >
          Your file size : {formatFileSize(selectedFile?.size!)}
        </p>
      </DialogContent>
    </Dialog>
  );
};

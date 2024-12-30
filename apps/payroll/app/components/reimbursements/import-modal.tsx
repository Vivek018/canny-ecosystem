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

  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const navigate = useNavigate();

  const isOpen =
    searchParams.get("step") === modalSearchParamNames.import_reimbursement;

  const onClose = () => {
    searchParams.delete("step");
    setSearchParams(searchParams);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files![0];
    setSelectedFile(file);
  };

  const handleFileSubmit = () => {
    navigate("/approvals/reimbursements/import-data", {
      state: { file: selectedFile },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Choose the file to be imported</DialogTitle>
        <div className="flex justify-between">
          <DialogDescription className="text-muted-foreground">
            only .csv format supported! <br />
            maximum upload size is 5MB!
          </DialogDescription>
          <Button
            className={selectedFile ? "flex" : "hidden"}
            onClick={handleFileSubmit}
          >
            Confirm file
          </Button>
        </div>

        <Input type="file" accept=".csv"  onChange={handleFileSelect} />

        <p
          className={
            selectedFile ? "flex text-sm text-muted-foreground" : "hidden"
          }
        >
          Your file size : {selectedFile?.size} KB
        </p>
      </DialogContent>
    </Dialog>
  );
};

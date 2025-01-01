import { Button } from "@canny_ecosystem/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useState, useEffect } from "react";



export const ImportReimbursementModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [eligibleFileSize, setEligibleFileSize] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const navigate = useNavigate();
  const MAX_FILE_SIZE_LIMIT = 3145728; // 3MB

  const isOpen =
    searchParams.get("step") === modalSearchParamNames.import_reimbursement;

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
      navigate("/approvals/reimbursements/import-data", {
        state: { file: selectedFile },
      });
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} Bytes`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Choose the file to be imported</DialogTitle>
        <div className="flex justify-between">
          <DialogDescription className="text-muted-foreground">
            Only .csv format is supported! <br />
            Maximum upload size is 3MB!
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

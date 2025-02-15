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
import { ErrorList } from "@canny_ecosystem/ui/forms";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { DELETE_TEXT } from "@canny_ecosystem/utils/constant";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";

export const DeleteSitePaymentTemplateAssignment = ({
  projectId,
  templateAssignmentId,
}: {
  projectId: string;
  templateAssignmentId: string;
}) => {
  const [isLoading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string[]>([]);
  const submit = useSubmit();

  const handleCancelEmployeePaymentTemplateAssignment = () => {
    setInputError([]);
    setInputValue("");
    setLoading(false);
  };

  const handleDeleteSitePaymentTemplateAssignment = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (inputValue === DELETE_TEXT) {
      setLoading(true);
      submit(
        {
          returnTo: `/projects/${projectId}/sites`,
        },
        {
          method: "POST",
          action: `/templates/${projectId}/${templateAssignmentId}/delete-site-link`,
        }
      );
    } else {
      e.preventDefault();
      setInputError(["Please type the correct text to confirm"]);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "destructive-outline", size: "full" }),
          "text-[13px] h-9"
        )}
      >
        Delete link template
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            employee's payment template assignment and remove it's data from our
            servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='p-4'>
          <p className='text-sm text-foreground/80'>
            Please type{" "}
            <i className='text-foreground font-medium'>{DELETE_TEXT}</i> to
            confirm.
          </p>
          <Input
            type='text'
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInputError([]);
            }}
            className='border border-input rounded-md h-10 w-full'
            placeholder='Confirm your action'
            onPaste={(e) => {
              e.preventDefault();
              return false;
            }}
          />
          <ErrorList errors={inputError} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancelEmployeePaymentTemplateAssignment}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={handleDeleteSitePaymentTemplateAssignment}
            onSelect={handleDeleteSitePaymentTemplateAssignment}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

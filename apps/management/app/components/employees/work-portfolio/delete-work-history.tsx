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

export const DeleteWorkHistory = ({
  employeeId,
  workHistoryId,
}: {
  employeeId: string;
  workHistoryId: string;
}) => {
  const [isLoading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string[]>([]);
  const submit = useSubmit();

  const handleCancelWorkHistory = () => {
    setInputError([]);
    setInputValue("");
    setLoading(false);
  };

  const handleDeleteWorkHistory = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (inputValue === DELETE_TEXT) {
      setLoading(true);
      submit(
        {},
        {
          method: "post",
          action: `/employees/${employeeId}/work-portfolio/${workHistoryId}/delete-work-history`,
          replace: true,
        }
      );
    } else {
      e.preventDefault();
      setInputError(["Please type the correct text to confirm."]);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "destructive-ghost", size: "full" }),
          "text-[13px] h-9"
        )}
      >
        Delete Work History
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this work
            history and remove it's data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='py-4'>
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
          <AlertDialogCancel onClick={handleCancelWorkHistory}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={handleDeleteWorkHistory}
            onSelect={handleDeleteWorkHistory}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

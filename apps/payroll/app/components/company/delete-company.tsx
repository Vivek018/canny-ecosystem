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
import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { ErrorList } from "@canny_ecosystem/ui/forms";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { DELETE_TEXT } from "@canny_ecosystem/utils/constant";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";

export const DeleteCompany = ({ companyId }: { companyId: string }) => {
  const [isLoading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string[]>([]);
  const submit = useSubmit();

  const handleCancelCompany = () => {
    setInputError([]);
    setInputValue("");
    setLoading(false);
  };

  const handleDeleteCompany = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (inputValue === DELETE_TEXT) {
      setLoading(true);
      submit(
        {},
        {
          method: "post",
          action: `/${companyId}/delete-company`,
          replace: true,
        },
      );
    } else {
      e.preventDefault();
      setInputError(["Please type the correct text to confirm."]);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Delete Company</CardTitle>
        <CardDescription>
          Permanently remove your company and all of its contents from the canny
          platform.
        </CardDescription>
      </CardHeader>
      <CardFooter className="border-t pt-6 flex justify-between">
        <div>This action is not reversible — please continue with caution.</div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isLoading} variant="destructive-outline">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                company and remove it's data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-sm text-foreground/80">
                Please type{" "}
                <i className="text-foreground font-medium">{DELETE_TEXT}</i> to
                confirm.
              </p>
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setInputError([]);
                }}
                className="border border-input rounded-md h-10 w-full"
                placeholder="Confirm your action"
                onPaste={(e) => {
                  e.preventDefault();
                  return false;
                }}
              />
              <ErrorList errors={inputError} />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelCompany}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className={cn(buttonVariants({ variant: "destructive" }))}
                onClick={handleDeleteCompany}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

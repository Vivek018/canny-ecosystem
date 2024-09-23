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
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";

export const DeleteCompany = ({companyId}: {companyId: string}) => {
  const [isLoading, setLoading] = useState(false);
  const submit = useSubmit();

  const handleDeleteCompany = () => {
    setLoading(true);
    submit(
      {},
      {
        method: "post",
        action: `/${companyId}/delete-company`,
        replace: true,
      },
    );
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
      <CardFooter className="flex justify-between">
        <div>This action is not reversible — please continue with caution.</div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive-outline">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                company and remove it's data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
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

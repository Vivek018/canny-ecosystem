import { useUserRole } from "@/utils/user";
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
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { deleteRole, hasPermission } from "@canny_ecosystem/utils";
import { DELETE_TEXT } from "@canny_ecosystem/utils/constant";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";

export const DeleteGratuity = ({ gratuityId }: { gratuityId: string }) => {
  const { role } = useUserRole();
  const [isLoading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string[]>([]);
  const submit = useSubmit();

  const handleCancelGratuity = () => {
    setInputError([]);
    setInputValue("");
    setLoading(false);
  };

  const handleDeleteGratuity = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (inputValue === DELETE_TEXT) {
      setLoading(true);
      submit(
        {},
        {
          method: "post",
          action: `${gratuityId}/delete-gratuity`,
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
          buttonVariants({ variant: "destructive-outline" }),
          "text-sm h-9 flex gap-1 items-center",
          !hasPermission(
            `${role}`,
            `${deleteRole}:statutory_fields_graduity`
          ) && "hidden"
        )}
      >
        <Icon name="trash" size="md" />
        <span>Delete Gratuity</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            gratuity and remove it's data from our servers.
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
          <AlertDialogCancel onClick={handleCancelGratuity}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={handleDeleteGratuity}
            onSelect={handleDeleteGratuity}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

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
import { DELETE_TEXT } from "@canny_ecosystem/utils/constant";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";

export const DeleteEmployeeProvidentFund = ({ employeeProvidentFundId }: { employeeProvidentFundId: string }) => {
    const [isLoading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [inputError, setInputError] = useState<string[]>([]);
    const submit = useSubmit();

    const handleCancelEPF = () => {
        setInputError([]);
        setInputValue("");
        setLoading(false);
    };

    const handleDeleteEPF = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
        if (inputValue === DELETE_TEXT) {
            setLoading(true);
            submit(
                {},
                {
                    method: "post",
                    action: `${employeeProvidentFundId}/delete-epf`,
                    replace: true,
                },
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
                )}
            >
                <Icon name="trash"size="md" />
                <span>Delete EPF</span>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your EPF and remove it's data from our servers.
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
                    <AlertDialogCancel onClick={handleCancelEPF}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className={cn(buttonVariants({ variant: "destructive" }))}
                        onClick={handleDeleteEPF}
                        onSelect={handleDeleteEPF}
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { Button } from "@canny_ecosystem/ui/button";

export default function Previewer({
  description,
  label,
}: {
  description: string;
  label: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="truncate text-left w-52">
        {description}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">{label}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="w-full">
          {description}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Button
              variant={"ghost"}
              className="p-0 h-0 text-xs font-extrabold "
              title="Remove field"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@canny_ecosystem/ui/dialog";

export default function Previewer({
  description,
  label,
}: {
  description: string;
  label: string;
}) {
  return (
    <Dialog>
      <DialogTrigger className="truncate text-left w-52 text-muted-foreground">
        {description}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{label}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="w-full">{description}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

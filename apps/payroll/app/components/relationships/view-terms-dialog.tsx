import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { Label } from "@canny_ecosystem/ui/label";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";

export const ViewRelationshipTermsDialog = ({
  values,
}: {
  values: any;
}) => {
  const navigate = useNavigate();

  const handleOpenChange = () => {
    navigate(-1);
  };

  const objectKeys = Object.keys(values);
  const objectValues: string[] = Object.values(values);

  return (
    <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-max pl-5 pr-40">
        <DialogHeader className="mb-4">
          <DialogTitle>Term Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          {objectKeys.map((key, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={key + index} className="flex items-center gap-2">
              <Label className="font-bold">{replaceUnderscore(key)}:</Label>
              <p className="text-base">{objectValues[index]}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

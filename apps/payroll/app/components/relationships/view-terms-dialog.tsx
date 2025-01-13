import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { Label } from "@canny_ecosystem/ui/label";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { useNavigate, useSearchParams } from "@remix-run/react";

export const ViewRelationshipTermsDialog = ({
  values,
}: {
  values: any;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isParamRelationshipTerms =
    searchParams.get("step") === modalSearchParamNames.view_relationship_terms;

  const handleOpenChange = () => {
    navigate(-1);
  };

  const objectKeys = Object.keys(values);
  const objectValues: string[] = Object.values(values);

  return (
    <Dialog open={isParamRelationshipTerms} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-w-max pl-5 pr-40",
          !objectKeys.length && "pr-4 pl-4",
        )}
      >
        <DialogHeader className="mb-4">
          <DialogTitle>Term Details</DialogTitle>
        </DialogHeader>
        <div
          className={cn("flex flex-col gap-6", !objectKeys.length && "hidden")}
        >
          {objectKeys.map((key, index) => (
            <div
              key={key.toString() + index.toString()}
              className="flex items-center gap-2"
            >
              <Label className="font-bold">{replaceUnderscore(key)}:</Label>
              <p className="text-base">{objectValues[index]}</p>
            </div>
          ))}
        </div>
        <p className={cn("hidden text-sm w-96", !objectKeys.length && "flex")}>
          There are no terms for this relationship. Please contact your
          administrator.
        </p>
      </DialogContent>
    </Dialog>
  );
};

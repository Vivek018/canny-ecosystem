import { workingDaysOptions } from "@/constant";
import type { SitePaySequenceDatabaseRow } from "@canny_ecosystem/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { Label } from "@canny_ecosystem/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@canny_ecosystem/ui/toggle-group";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { getOrdinalSuffix } from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";

export const ViewPaySequenceDialog = ({
  values,
}: { values: Omit<SitePaySequenceDatabaseRow, "created_at" | "updated_at"> }) => {
  const navigate = useNavigate();

  const handleOpenChange = () => {
    navigate(-1);
  };

  return (
    <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-max">
        <DialogHeader className="mb-4">
          <DialogTitle>Pay Sequence Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Label className="font-bold">Pay Day:</Label>
            <p className="text-base">
              {getOrdinalSuffix(values.pay_day)} of every month
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="font-bold">Pay Frequency:</Label>
            <p className="capitalize">{values.pay_frequency}</p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-max font-bold">Working Days:</Label>
            <ToggleGroup
              type="multiple"
              variant="outline"
              className="flex gap-2"
              disabled={true}
            >
              {workingDaysOptions.map(({ label, value }) => (
                <ToggleGroupItem
                  key={value}
                  className={cn(
                    "flex items-center space-x-2 disabled:opacity-100",
                    values.working_days.includes(Number.parseInt(value)) &&
                      "bg-secondary",
                  )}
                >
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

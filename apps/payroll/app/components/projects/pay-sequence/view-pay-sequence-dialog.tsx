import { workingDaysOptions } from "@/constant";
import type { PaySequenceDatabaseRow } from "@canny_ecosystem/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { Label } from "@canny_ecosystem/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@canny_ecosystem/ui/toggle-group";
import { getOrdinalSuffix } from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";

export const ViewPaySequenceDialog = ({
  values,
}: { values: Omit<PaySequenceDatabaseRow, "created_at"> }) => {
  const navigate = useNavigate();

  const handleOpenChange = () => {
    navigate("/projects");
  };

  return (
    <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-max">
        <DialogHeader className="mb-4">
          <DialogTitle>Pay Sequence Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Label>Pay Day:</Label>
            <p>
              {getOrdinalSuffix(values.pay_day)} of every month
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label>Pay Frequency:</Label>
            <p className="capitalize">{values.pay_frequency}</p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="w-max">Working Days:</Label>
            <ToggleGroup
              type="multiple"
              variant="outline"
              disabled
              className="flex gap-2"
            >
              {values.working_days.map((day) => (
                <ToggleGroupItem
                  key={day}
                  className="flex items-center bg-secondary space-x-2"
                >
                  {
                    workingDaysOptions.find(
                      (workingDay) => workingDay.value === String(day),
                    )?.label
                  }
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

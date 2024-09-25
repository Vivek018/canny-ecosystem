import type { PaySequenceDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@canny_ecosystem/ui/sheet";
import { useNavigate } from "@remix-run/react";
import { EditPaySequenceForm } from "./edit-pay-sequence-form";

export const EditPaySequenceSheet = ({updateValues}: {updateValues: PaySequenceDatabaseUpdate}) => {
  const navigate = useNavigate();

  const handleOpenChange = () => {
    navigate("/projects");
  };
  return (
    <Sheet defaultOpen={true} onOpenChange={handleOpenChange}>
      <SheetContent className="w-[460px]">
        <SheetHeader className="mb-8">
          <SheetTitle>Edit Pay Sequence</SheetTitle>
        </SheetHeader>

          <EditPaySequenceForm updateValues={updateValues} />
      </SheetContent>
    </Sheet>
  );
}

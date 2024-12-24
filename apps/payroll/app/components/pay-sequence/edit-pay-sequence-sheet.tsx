import type { SitePaySequenceDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@canny_ecosystem/ui/sheet";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { EditPaySequenceForm } from "./form/edit-pay-sequence-form";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";

export const EditPaySequenceSheet = ({
  updateValues,
  projectId,
}: {
  updateValues: SitePaySequenceDatabaseUpdate;
  projectId: string;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isParamEditPaySequence =
    searchParams.get("step") === modalSearchParamNames.edit_pay_sequence;

  const handleOpenChange = () => {
    navigate(-1);
  };
  return (
    <Sheet open={isParamEditPaySequence} onOpenChange={handleOpenChange}>
      <SheetContent className='w-[460px]'>
        <SheetHeader className='mb-8'>
          <SheetTitle>Edit Pay Sequence</SheetTitle>
        </SheetHeader>

        <EditPaySequenceForm
          updateValues={updateValues}
          projectId={projectId}
        />
      </SheetContent>
    </Sheet>
  );
};

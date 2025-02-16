import type { SitePaySequenceDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@canny_ecosystem/ui/sheet";
import { useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { EditPaySequenceForm } from "./form/edit-pay-sequence-form";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";

export const EditPaySequenceSheet = ({
  updateValues,
}: {
  updateValues: SitePaySequenceDatabaseUpdate;
}) => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isOpen =
    searchParams.get("step") === modalSearchParamNames.edit_pay_sequence;

  const handleOpenChange = () => {
    navigate(`/projects/${projectId}/sites`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-[460px]">
        <SheetHeader className="mb-8">
          <SheetTitle>Edit Pay Sequence</SheetTitle>
        </SheetHeader>

        <EditPaySequenceForm
          updateValues={updateValues}
          projectId={projectId!}
        />
      </SheetContent>
    </Sheet>
  );
};

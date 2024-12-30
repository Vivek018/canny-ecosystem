import { Dialog, DialogContent, DialogTitle } from "@canny_ecosystem/ui/dialog";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { SiteLinkedTemplates } from "../sites/site-linked-templates";
import type { PaymentTemplateAssignmentsType } from "@canny_ecosystem/supabase/queries";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { SiteDialogForm } from "./site-dialog-form";

export function SiteDialog({
  siteId,
  projectId,
  paymentTemplateOptions,
  linkTemplates,
}: {
  siteId: string;
  projectId: string;
  paymentTemplateOptions: ComboboxSelectOption[];
  linkTemplates: PaymentTemplateAssignmentsType[];
}) {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const isViewLinkTemplate =
    searchParams.get("step") === modalSearchParamNames.view_link_template;

  const action = searchParams.get("action");
  const isUpdateAction = action === modalSearchParamNames.update_link_template;

  const handleOpenChange = () => {
    navigate(`/projects/${projectId}/sites`, {
      replace: true,
    });
  };

  return (
    <Dialog open={isViewLinkTemplate} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogTitle className='text-xl font-semibold mb-4'>
          {isUpdateAction ? "Update" : "Create"} Link Payment Template
        </DialogTitle>
        {action ? (
          <SiteDialogForm
            siteId={siteId}
            projectId={projectId}
            action={action}
            linkTemplates={linkTemplates}
            paymentTemplateOptions={paymentTemplateOptions}
          />
        ) : (
          <SiteLinkedTemplates linkedTemplates={linkTemplates} />
        )}
      </DialogContent>
    </Dialog>
  );
}

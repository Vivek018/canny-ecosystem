import type { PaymentTemplateComponentType } from "@canny_ecosystem/supabase/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { useNavigate } from "@remix-run/react";

export const PaymentTemplateComponentsCard = ({
  paymentTemplateComponents,
}: {
  paymentTemplateComponents: PaymentTemplateComponentType[];
}) => {
  const navigate = useNavigate();

  const handleOpenChange = () => {
    navigate(-1);
  };

  return (
    <Dialog defaultOpen={true} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-max">
        <DialogTitle>Payment Template Components</DialogTitle>
        <DialogDescription>
          {paymentTemplateComponents.map((paymentTemplateComponent) => (
            <div
              key={paymentTemplateComponent?.id}
              className='grid grid-cols-3 place-content-center justify-between gap-6 py-4'
            >
              <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm items-center shadow-sm'>
                {String(paymentTemplateComponent?.payment_fields?.name) ??
                  String(paymentTemplateComponent?.target_type) ??
                  "Unknown"}
              </div>
              <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm items-center shadow-sm'>
                {paymentTemplateComponent?.component_type}
              </div>
              <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm items-center shadow-sm'>
                {paymentTemplateComponent?.calculation_value}
              </div>
            </div>
          ))}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

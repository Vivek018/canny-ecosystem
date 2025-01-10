import type { PaymentTemplateComponentType } from "@canny_ecosystem/supabase/queries";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { replaceUnderscore } from "@canny_ecosystem/utils";
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
      <DialogContent className='min-w-max'>
        <DialogTitle>Payment Template Components</DialogTitle>
        <div className="flex flex-col w-full h-full">
          <div className='grid grid-cols-3 place-content-center justify-between gap-4 py-4 text-foreground text-base font-semibold'>
            <span>Component Name</span>
            <span>Component Type</span>
            <span>Amount</span>
          </div>
          <div className='max-h-96 overflow-y-auto'>
            {paymentTemplateComponents.map((paymentTemplateComponent) => {
              const name =
                paymentTemplateComponent?.payment_fields?.name ??
                paymentTemplateComponent?.target_type ??
                "Unknown";

              return (
                <div
                  key={paymentTemplateComponent?.id}
                  className='grid grid-cols-3 place-content-center justify-between gap-4 py-3'
                >
                  <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm items-center shadow-sm'>
                    {String(name)}
                  </div>
                  <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm items-center shadow-sm'>
                    {replaceUnderscore(
                      paymentTemplateComponent?.component_type
                    )}
                  </div>
                  <div className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm items-center shadow-sm'>
                    {paymentTemplateComponent?.calculation_value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

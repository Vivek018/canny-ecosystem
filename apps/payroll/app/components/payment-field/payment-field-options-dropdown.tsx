import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate, useSubmit } from "@remix-run/react";
import { DeletePaymentField } from "./delete-payment-field";

export const PaymentFieldOptionsDropdown = ({
  paymentField,
  triggerChild,
}: {
  paymentField: {
    id: string;
    is_active: boolean;
    returnTo?: string;
  };
  triggerChild: React.ReactElement;
}) => {
  const submit = useSubmit();
  const navigate = useNavigate();

  const handleMarkAsActive = () => {
    submit(
      {
        id: paymentField.id,
        is_active: true,
        returnTo: paymentField.returnTo ?? "/payment-fields",
      },
      {
        method: "POST",
        action: `/payment-fields/${paymentField.id}/update-payment-field-status`,
      },
    );
  };

  const handleMarkAsInactive = () => {
    submit(
      {
        id: paymentField.id,
        is_active: false,
        returnTo: paymentField.returnTo ?? "/payment-fields",
      },
      {
        method: "POST",
        action: `/payment-fields/${paymentField.id}/update-payment-field-status`,
      },
    );
  };

  const handleEdit = () => {
    navigate(`/payment-fields/${paymentField.id}/update-payment-field`);
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(paymentField.is_active && "hidden")}
            onClick={handleMarkAsActive}
          >
            Make as Active
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(!paymentField.is_active && "hidden")}
            onClick={handleMarkAsInactive}
          >
            Make as Inactive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            Edit payment field
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeletePaymentField paymentFieldId={paymentField.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

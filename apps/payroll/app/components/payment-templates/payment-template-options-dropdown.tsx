import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { useNavigate } from "@remix-run/react";
import { DeletePaymentTemplate } from "./delete-payment-template";

export const PaymentTemplateOptionsDropdown = ({
  paymentTemplate,
  triggerChild,
}: {
  paymentTemplate: {
    id: string;
  };
  triggerChild: React.ReactElement;
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(
      `/payment-components/payment-templates/${paymentTemplate.id}/update-payment-template`
    );
  };

  const handleEditComponents = () => {
    navigate(
      `/payment-components/payment-templates/${paymentTemplate.id}/update-payment-template-components`
    );
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align='end'>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleEdit}>
            Edit Payment Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditComponents}>
            Edit Template Components
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeletePaymentTemplate paymentTemplateId={paymentTemplate.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { useNavigate } from "@remix-run/react";
import { DeletePaymentTemplate } from "./delete-payment-template";
import { attribute, modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUserRole } from "@/utils/user";

export const PaymentTemplateOptionsDropdown = ({
  paymentTemplate,
  triggerChild,
}: {
  paymentTemplate: {
    id: string;
  };
  triggerChild: React.ReactElement;
}) => {
  const { role } = useUserRole();
  const navigate = useNavigate();

  const handleViewComponents = () => {
    navigate(
      `/payment-components/payment-templates/${paymentTemplate.id}?step=${modalSearchParamNames.view_template_components}`
    );
  };

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
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleViewComponents}>
            View Template Components
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              !hasPermission(role, `${updateRole}:${attribute.paymentTemplates}`) &&
                !hasPermission(role, `${deleteRole}:${attribute.paymentTemplates}`) &&
                "hidden"
            )}
          />
          <DropdownMenuItem
            onClick={handleEdit}
            className={cn(
              "hidden",
              hasPermission(role, `${updateRole}:${attribute.paymentTemplates}`) &&
                "flex"
            )}
          >
            Edit Payment Template
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleEditComponents}
            className={cn(
              "hidden",
              hasPermission(role, `${updateRole}:${attribute.paymentTemplates}`) &&
                "flex"
            )}
          >
            Edit Template Components
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.paymentTemplates}`) &&
                "flex"
            )}
          />
          <DeletePaymentTemplate paymentTemplateId={paymentTemplate.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

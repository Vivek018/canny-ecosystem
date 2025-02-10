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
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

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
  const { role } = useUser();
  const submit = useSubmit();
  const navigate = useNavigate();

  const handleMarkAsActive = () => {
    submit(
      {
        id: paymentField.id,
        is_active: true,
        returnTo: paymentField.returnTo ?? "/payment-components/payment-fields",
      },
      {
        method: "POST",
        action: `/payment-components/payment-fields/${paymentField.id}/update-payment-field-status`,
      }
    );
  };

  const handleMarkAsInactive = () => {
    submit(
      {
        id: paymentField.id,
        is_active: false,
        returnTo: paymentField.returnTo ?? "/payment-components/payment-fields",
      },
      {
        method: "POST",
        action: `/payment-components/payment-fields/${paymentField.id}/update-payment-field-status`,
      }
    );
  };

  const handleEdit = () => {
    navigate(
      `/payment-components/payment-fields/${paymentField.id}/update-payment-field`
    );
  };

  const handleReports = () => {
    navigate(`/payment-components/payment-fields/${paymentField.id}/reports`);
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align='end'>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleReports}>
            View Report
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator
          className={cn(
            !hasPermission(role, `${updateRole}:${attribute.paymentFields}`) &&
              !hasPermission(
                role,
                `${deleteRole}:${attribute.paymentFields}`
              ) &&
              "hidden"
          )}
        />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              paymentField.is_active && "hidden",
              !hasPermission(
                role,
                `${updateRole}:${attribute.paymentFields}`
              ) && "hidden"
            )}
            onClick={handleMarkAsActive}
          >
            Make as Active
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              !paymentField.is_active && "hidden",
              !hasPermission(
                role,
                `${updateRole}:${attribute.paymentFields}`
              ) && "hidden"
            )}
            onClick={handleMarkAsInactive}
          >
            Make as Inactive
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleEdit}
            className={cn(
              "hidden",
              hasPermission(role, `${updateRole}:${attribute.paymentFields}`) &&
                "flex"
            )}
          >
            Edit payment field
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.paymentFields}`) &&
                "flex"
            )}
          />
          <DeletePaymentField paymentFieldId={paymentField.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

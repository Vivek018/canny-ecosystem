import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate } from "@remix-run/react";
import { createRole, deleteRole, hasPermission } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { DeleteEmployeePaymentTemplateAssignment } from "./delete-employee-payment-template-assignment";

export const LinkTemplateDropdown = ({
  employeeId,
  triggerChild,
}: {
  employeeId: string;
  triggerChild: React.ReactElement;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              !hasPermission(role, `${createRole}:${attribute.employeePaymentTemplateLink}`) &&
              "hidden",
            )}
            onClick={() => navigate(`/employees/${employeeId}/payments/link-template`)}
          >
            Edit template
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.employeePaymentTemplateLink}`) &&
              "flex",
            )}
          />
          <DeleteEmployeePaymentTemplateAssignment employeeId={employeeId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteEmployeePaymentTemplateAssignment } from "./delete-employee-payment-template-assignment";
import { useSearchParams } from "@remix-run/react";
import {
  attribute,
  modalSearchParamNames,
} from "@canny_ecosystem/utils/constant";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { deleteRole, hasPermission } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";

export const LinkTemplateDropdown = ({
  templateAssignmentId,
  triggerChild,
}: {
  templateAssignmentId: string | null;
  triggerChild: React.ReactElement;
}) => {
  const { role } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const handleViewComponents = () => {
    searchParams.set("step", modalSearchParamNames.view_template_components);
    setSearchParams(searchParams);
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
              !hasPermission(
                `${role}`,
                `${deleteRole}:${attribute.employeePaymentTemplateLink}`,
              ) && "hidden",
            )}
          />
          <DeleteEmployeePaymentTemplateAssignment
            templateAssignmentId={templateAssignmentId}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

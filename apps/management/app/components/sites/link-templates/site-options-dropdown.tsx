import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate, useParams } from "@remix-run/react";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { DeleteSitePaymentTemplateAssignment } from "./delete-site-payment-template-assignment";

export const SiteOptionsDropdown = ({
  currentPaymentTemplateAssignmentId,
  triggerChild,
}: {
  currentPaymentTemplateAssignmentId: string;
  triggerChild: React.ReactElement;
}) => {
  const { projectId, siteId } = useParams();
  const { role } = useUser();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(
      `/projects/${projectId}/${siteId}/link-templates/${currentPaymentTemplateAssignmentId}/update-site-template`,
    );
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleEdit}
            className={cn(
              "hidden",
              hasPermission(role, `${updateRole}:${attribute.site}`) && "flex",
            )}
          >
            Edit Link Assignment
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.site}`) && "flex",
            )}
          />
          <DeleteSitePaymentTemplateAssignment
            projectId={projectId}
            siteId={siteId}
            templateAssignmentId={currentPaymentTemplateAssignmentId}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

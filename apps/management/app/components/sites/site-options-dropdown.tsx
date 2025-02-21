import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate } from "@remix-run/react";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute, modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { DeleteSitePaymentTemplateAssignment } from "./delete-site-payment-template-assignment";

export const SiteOptionsDropdown = ({
  projectId,
  siteId,
  currentPaymentTemplateAssignmentId,
  triggerChild,
}: {
  projectId: string;
  siteId: string;
  currentPaymentTemplateAssignmentId: string;
  triggerChild: React.ReactElement;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/projects/${projectId}/${siteId}/link-templates/manipulate-template?action=${modalSearchParamNames.update_link_template}&currentPaymentTemplateAssignmentId=${currentPaymentTemplateAssignmentId}`);
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
              hasPermission(role, `${updateRole}:${attribute.projectSite}`) &&
              "flex",
            )}
          >
            Edit Assignment
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.projectSite}`) &&
              "flex",
            )}
          />
          <DeleteSitePaymentTemplateAssignment projectId={projectId} templateAssignmentId={currentPaymentTemplateAssignmentId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

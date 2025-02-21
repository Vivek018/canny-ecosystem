import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteSite } from "../sites/delete-site";

export const OverViewSiteCardDropdown = ({
  projectId,
  siteId,
  triggerChild,
}: {
  projectId: string;
  siteId: string;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DeleteSite projectId={projectId} siteId={siteId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

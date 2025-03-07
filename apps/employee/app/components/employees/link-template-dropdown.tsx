import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@canny_ecosystem/ui/dropdown-menu";
import { useSearchParams } from "@remix-run/react";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";

export const LinkTemplateDropdown = ({
  triggerChild,
}: {
  triggerChild: React.ReactElement;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const handleViewComponents = () => {
    searchParams.set("step", modalSearchParamNames.view_template_components);
    setSearchParams(searchParams);
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align='end'>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleViewComponents}>
            View Template Components
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteExit } from "../exits/delete-exit";

export const ExitOptionsDropdown = ({
  exitId,
  triggerChild,
}: {
  exitId: string;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>Edit Exit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteExit exitId={exitId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

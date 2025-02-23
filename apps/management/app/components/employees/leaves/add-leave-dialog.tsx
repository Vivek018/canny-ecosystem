import { useUser } from "@/utils/user";
import { Button } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import {
  attribute,
} from "@canny_ecosystem/utils/constant";
import { useNavigate} from "@remix-run/react";

export function AddLeaveDialog() {
  const { role } = useUser();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={cn(
          !hasPermission(role, `${createRole}:${attribute.employeeLeaves}`) && "hidden"
        )}
      >
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Icon name="plus" className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuItem
          onClick={() => navigate("add-leaves")}
          className="space-x-2"
        >
          <Icon name="plus-circled" size="sm" />
          <span>Create Leave</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

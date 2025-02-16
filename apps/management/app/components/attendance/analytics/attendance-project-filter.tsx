import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useState } from "react";

export function AttendanceProjectFilter({
  disabled,
  projectArray,
  setProject,
}: {
  disabled?: boolean;
  projectArray: string[];
  setProject: (project: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="absolute top-2 right-2 w-full md:w-auto items-center">
        <DropdownMenuTrigger disabled={disabled} asChild>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            type="button"
            disabled={disabled}
            className={cn(
              "border-2 border-muted rounded-lg p-2 opacity-70 grid place-items-center",
              !disabled &&
                "transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100",
              isOpen && "opacity-100",
            )}
          >
            <Icon name="mixer" />
          </button>
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuContent
        className="w-full md:w-[280px]"
        align="end"
        sideOffset={-50}
        alignOffset={50}
        side="top"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Project</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={10}
                alignOffset={-4}
                className="p-0"
              >
                {projectArray?.map((name, index) => (
                  <DropdownMenuCheckboxItem
                    key={name + index.toString()}
                    className="capitalize"
                    onCheckedChange={() => {
                      setProject(name);
                    }}
                  >
                    {name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

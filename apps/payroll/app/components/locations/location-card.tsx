import type { LocationDatabaseRow } from "@canny_ecosystem/supabase/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";
import { DeleteLocation } from "./delete-location";

export function LocationCard({
  location,
}: {
  location: Omit<LocationDatabaseRow, "created_at" | "company_id">;
}) {
  return (
    <div
      key={location.id}
      className="w-full h-full select-text cursor-auto flex flex-col justify-between border dark:border-2 border-secondary shadow-md rounded-md overflow-hidden"
    >
      <div className="p-4 gap-5 flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-wide">{location.name}</h2>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Link
                    to={`/${location.id}/update-location`}
                    className="p-2 rounded-full bg-secondary grid place-items-center border-foreground"
                  >
                    <Icon name="edit" size="xs" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 py-2 rounded-full bg-secondary grid place-items-center border-foreground">
                <Icon name="dots" size="xs" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="py-2 text-[13px]"
                    onClick={() => {
                      navigator.clipboard.writeText(location.esic_code);
                    }}
                  >
                    Copy ESIC Code
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DeleteLocation locationId={location.id} />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <address className="not-italic">{location.address}</address>
          <div className="flex items-center capitalize gap-2">
            <p>{`${location.city},`}</p>
            <p>{`${location.state}`}</p>
            <p>{`- ${location.pin_code}`}</p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "px-2.5 ml-auto bg-secondary text-secondary-foreground py-1.5 text-sm tracking-wide font-sem rounded-tl-md border-foreground flex gap-1 justify-center",
          !location.is_main && "opacity-0",
        )}
      >
        <Icon name="dot-filled" size="xs" />
        Main
      </div>
    </div>
  );
}

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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { replaceUnderscore } from "@canny_ecosystem/utils";

export function LocationCard({
  location,
}: {
  location: Omit<LocationDatabaseRow, "created_at" | "updated_at">;
}) {
  return (
    <Card
      key={location.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-center justify-between p-4">
        <CardTitle className="text-lg tracking-wide">{location.name}</CardTitle>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`/settings/${location.id}/update-location`}
                  className="p-2 rounded-md bg-secondary grid place-items-center"
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 py-2 rounded-md bg-secondary grid place-items-center">
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={cn(
                    "py-2 text-[13px]",
                    !location.latitude && "hidden",
                  )}
                  onClick={() => {
                    navigator.clipboard.writeText(String(location.latitude));
                  }}
                >
                  Copy Latitude
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "py-2 text-[13px]",
                    !location.longitude && "hidden",
                  )}
                  onClick={() => {
                    navigator.clipboard.writeText(String(location.longitude));
                  }}
                >
                  Copy Longitude
                </DropdownMenuItem>
                <DropdownMenuSeparator
                  className={cn(
                    !location.latitude && !location.longitude && "hidden",
                  )}
                />
                <DeleteLocation locationId={location.id} />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-4">
        <address className="not-italic line-clamp-3">
          {`${location.address_line_1} ${
            location.address_line_2 ? location.address_line_2 : ""
          }`}
        </address>
        <div className="flex items-center capitalize gap-2">
          <p>{`${location.city},`}</p>
          <p>{`${replaceUnderscore(location.state)}`}</p>
          <p>{`- ${location.pincode}`}</p>
        </div>
      </CardContent>
      <CardFooter
        className={cn(
          "px-2.5 ml-auto bg-secondary text-foreground py-1.5 text-sm tracking-wide font-sem rounded-tl-md border-foreground flex gap-1 justify-center",
          !location.is_primary && "opacity-0",
        )}
      >
        <Icon name="dot-filled" size="xs" />
        Primary
      </CardFooter>
    </Card>
  );
}

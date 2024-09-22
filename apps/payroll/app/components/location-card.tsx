import type { LocationDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";

export function LocationCard({
  location,
}: {
  location: Omit<LocationDatabaseRow, "created_at" | "company_id">;
}) {
  return (
    <div
      key={location.id}
      className="w-full h-full select-text cursor-auto flex flex-col justify-between border dark:border-2 border-secondary shadow-md shadow-muted rounded-md overflow-hidden"
    >
      <div className="p-4 gap-5 flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium tracking-wide">{location.name}</h2>
          <div className="flex items-center gap-3">
            <Link
              to={`/${location.id}/update-location`}
              className="p-2 rounded-full bg-secondary grid place-items-center border-foreground"
            >
              <Icon name="edit" size="xs" />
            </Link>
            <Link
              to={`/${location.id}/update-location`}
              className="p-2 rounded-full bg-secondary grid place-items-center border-foreground"
            >
              <Icon name="dots" size="xs" />
            </Link>
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
          "px-2 ml-auto bg-primary text-primary-foreground py-1.5 text-sm tracking-wide font-sem rounded-tl-md border-foreground flex gap-1 justify-center",
          !location.is_main && "hidden",
        )}
      >
        <Icon name="dot-filled" size="xs" />
        Main
      </div>
    </div>
  );
}

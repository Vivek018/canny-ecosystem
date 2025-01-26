import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@canny_ecosystem/ui/command";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { Link } from "@remix-run/react";
import { LocationCard } from "./location-card";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { LocationDatabaseRow } from "@canny_ecosystem/supabase/types";
import { useUserRole } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

export function LocationsWrapper({
  data,
  error,
}: {
  data: Omit<LocationDatabaseRow, "created_at" | "updated_at">[] | null;
  error: Error | null | { message: string };
}) {
  const { role } = useUserRole();
  const { isDocument } = useIsDocument();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <section className="py-4">
      <div className="w-full flex items-end justify-between">
        <Command className="overflow-visible">
          <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
            <CommandInput
              divClassName="border border-input rounded-md h-10 flex-1"
              placeholder="Search Locations"
              autoFocus={true}
            />
            <Link
              to="/settings/create-location"
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",
                !hasPermission(role, `${updateRole}:${attribute.settingLocations}`) &&
                  "hidden"
              )}
            >
              <span>Add</span>
              <span className="hidden md:flex justify-end">Location</span>
            </Link>
          </div>
          <CommandEmpty
            className={cn(
              "w-full py-40 capitalize text-lg tracking-wide text-center",
              !isDocument && "hidden"
            )}
          >
            No location found.
          </CommandEmpty>
          <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
            <CommandGroup className="p-0 overflow-visible">
              <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {data?.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={
                      location.name +
                      location.address_line_1 +
                      location.address_line_2 +
                      location.city +
                      replaceUnderscore(location.state) +
                      location.pincode
                    }
                    className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
                  >
                    <LocationCard location={location} />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </section>
  );
}

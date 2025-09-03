import { CommandItem } from "@canny_ecosystem/ui/command";
import { VehicleCard } from "./vehicle-card";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import type { VehiclesDatabaseRow } from "@canny_ecosystem/supabase/types";

export function VehiclesWrapper({
  data,
  error,
}: {
  data: Omit<VehiclesDatabaseRow, "created_at">[] | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(cacheKeyPrefix.vehicles);
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-2">
      {data?.map((vehicle) => (
        <CommandItem
          key={vehicle.id}
          className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
        >
          <VehicleCard vehicle={vehicle} />
        </CommandItem>
      ))}
    </div>
  );
}

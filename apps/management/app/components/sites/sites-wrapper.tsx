import { SiteCard } from "@/components/sites/site-card";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import type { SitesWithLocation } from "@canny_ecosystem/supabase/queries";
import { CommandGroup, CommandItem } from "@canny_ecosystem/ui/command";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import { useEffect } from "react";

export function SitesWrapper({
  data,
  error,
}: {
  data: Omit<SitesWithLocation, "created_at" | "updated_at">[] | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(cacheKeyPrefix.sites);
      toast({
        title: "Error",
        description: error?.message || "Failed to load sites",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <CommandGroup className="p-0 overflow-visible">
      <div className="w-full grid gap-8 grid-cols-1">
        {data?.map((site) => (
          <CommandItem
            key={site?.id}
            value={
              site?.name +
              site?.site_code +
              site?.company_location?.name +
              site?.project?.name +
              site?.company_id +
              site?.address_line_1 +
              site?.address_line_2 +
              site?.city +
              replaceUnderscore(site?.state) +
              site?.pincode +
              site?.capacity
            }
            className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
          >
            <SiteCard site={site} />
          </CommandItem>
        ))}
      </div>
    </CommandGroup>
  );
}

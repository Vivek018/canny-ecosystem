import { SiteCard } from "@/components/sites/site-card";
import type { SitesWithLocation } from "@canny_ecosystem/supabase/queries";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { CommandGroup, CommandItem } from "@canny_ecosystem/ui/command";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import { useEffect } from "react";

export function SitesWrapper({
  data,
  error,
  env,
  companyId,
}: {
  data: Omit<SitesWithLocation, "created_at" | "updated_at">[] | null;
  error: Error | null | { message: string };
  env: SupabaseEnv;
  companyId: string;
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load sites",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <CommandGroup className="p-0 overflow-visible">
      <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {data?.map((site) => (
          <CommandItem
            key={site.id}
            value={
              site.name +
              site.site_code +
              site.company_location?.name +
              site.address_line_1 +
              site.address_line_2 +
              site.city +
              replaceUnderscore(site.state) +
              site.pincode
            }
            className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
          >
            <SiteCard site={site} env={env} companyId={companyId} />
          </CommandItem>
        ))}
      </div>
    </CommandGroup>
  );
}

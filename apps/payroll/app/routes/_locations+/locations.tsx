import { LocationCard } from "@/components/location-card";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getLocationsInCompanyQuery } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
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
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const companyId = await getCompanyIdOrFirstCompany(request, supabase);
  const { data } = await getLocationsInCompanyQuery({ supabase, companyId });
  return json({ data });
}

export default function Locations() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <section className="py-3.5">
      <div className="w-full flex items-end justify-between">
        <Command className="overflow-visible">
          <div className="w-full md:w-3/4 lg:w-1/2 2xl:w-1/3 flex items-center gap-4">
            <CommandInput
              divClassName="border border-input rounded-md h-10 flex-1"
              placeholder="Search Locations"
              autoFocus
            />
            <Link
              to="/create-location"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Add Location
            </Link>
          </div>
          <CommandEmpty className="w-full py-40 capitalize text-lg tracking-wide text-center">
            No location found.
          </CommandEmpty>
          <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
            <CommandGroup className="p-0 overflow-visible">
              <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {data.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={
                      location.name +
                      location.address +
                      location.city +
                      location.state +
                      location.pin_code +
                      location.esic_code
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
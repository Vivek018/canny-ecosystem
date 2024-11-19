import { SiteCard } from "@/components/sites/site-card";
import { getSitesByProjectId } from "@canny_ecosystem/supabase/queries";
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
import { useIsDocument } from "@canny_ecosystem/ui/hooks/is-document";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  const { supabase } = getSupabaseWithHeaders({ request });

  if (!projectId) {
    throw new Error("No Project Id");
  }

  const { data, error } = await getSitesByProjectId({
    supabase,
    projectId,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No data found");
  }

  return json({ data, projectId });
}

export default function Sites() {
  const { data, projectId } = useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  return (
    <section className="pb-4">
      <div className="w-full flex items-end justify-between">
        <Command className="overflow-visible">
          <div className="w-full md:w-3/4 lg:w-1/2 2xl:w-1/3 py-4 flex items-center gap-4">
            <CommandInput
              divClassName="border border-input rounded-md h-10 flex-1"
              placeholder="Search Sites"
              autoFocus={true}
            />
            <Link
              to={`/projects/${projectId}/create-site`}
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",
              )}
            >
              <span>Add</span>
              <span className="hidden md:flex justify-end">Site</span>
            </Link>
          </div>
          <CommandEmpty
            className={cn(
              "w-full py-40 capitalize text-lg tracking-wide text-center",
              !isDocument && "hidden",
            )}
          >
            No site found.
          </CommandEmpty>
          <CommandList className="max-h-full py-2 overflow-x-visible overflow-y-visible">
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
                    <SiteCard site={site} />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
      <Outlet />
    </section>
  );
}

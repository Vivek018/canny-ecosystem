import {
  getPayrollsBySiteId,
  getSitesWithEmployeeCountByProjectId,
  type SitesWithLocation,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@canny_ecosystem/ui/command";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, defer, useLoaderData } from "@remix-run/react";
import { PayrollStatus } from "@/components/payroll/payroll-status";
import { Suspense } from "react";
import type { TypedSupabaseClient } from "@canny_ecosystem/supabase/types";
import { LoadingSpinner } from "@/components/loading-spinner";

async function enrichSiteData(
  supabase: TypedSupabaseClient,
  siteData: SitesWithLocation[],
) {
  const enrichedSites: any = [];

  await Promise.all(
    (siteData ?? []).map(async (site: SitesWithLocation) => {
      const { data: payrolls } = await getPayrollsBySiteId({
        supabase,
        site_id: site.id,
      });

      (payrolls ?? []).map((payroll) => {
        enrichedSites.push({
          ...site,
          runDate: payroll?.run_date,
          payrollId: payroll.id,
          is_approved: payroll.status === "approved",
        });
      });
    }),
  );

  return enrichedSites;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId as string;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { data: siteData, error: siteError } =
    await getSitesWithEmployeeCountByProjectId({
      supabase,
      projectId,
    });

  if (siteError) throw siteError;
  if (!siteData) throw new Error("No site data found");

  const enrichedDataPromise = enrichSiteData(supabase, siteData);

  return defer({ sitePromise: enrichedDataPromise });
}

export async function action() {
  return null;
}

export default function SitesIndex() {
  const { sitePromise } = useLoaderData<typeof loader>();

  return (
    <section className="p-4">
      <div className="w-full flex items-end justify-between">
        <Suspense fallback={<LoadingSpinner className="mt-40" />}>
          <Await resolve={sitePromise}>
            {(sites) => {
              const { isDocument } = useIsDocument();

              return (
                <Command className="overflow-visible">
                  <div className="w-full md:w-3/4 lg:w-1/2 2xl:w-1/3 py-4 flex items-center gap-4">
                    <CommandInput
                      divClassName="border border-input rounded-md h-10 flex-1"
                      placeholder="Search Sites"
                      autoFocus={true}
                    />
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
                    <CommandGroup className="w-full p-0 overflow-visible">
                      <div className="flex-col">
                        {sites?.map((site: any) => (
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
                            className="w-full data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
                          >
                            {site.is_approved && (
                              <PayrollStatus data={site} disable={false} />
                            )}
                          </CommandItem>
                        ))}
                      </div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

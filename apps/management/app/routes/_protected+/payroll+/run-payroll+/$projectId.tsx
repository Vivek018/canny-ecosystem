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
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, defer, useLoaderData } from "@remix-run/react";
import { PayrollStatus } from "@/components/payroll/payroll-status";
import { Suspense } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId as string;
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    // Create a promise that will resolve with all the site data
    const siteDataPromise = getSitesWithEmployeeCountByProjectId({
      supabase,
      projectId,
    }).then(async ({ data: siteData, error: siteError }) => {
      if (siteError) throw siteError;
      if (!siteData) throw new Error("No site data found");

      const currentDate = new Date();
      const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

      // Process each site concurrently
      const processedSites = await Promise.all(
        siteData.map(async (site) => {
          const [payrollsResult] = await Promise.all([
            getPayrollsBySiteId({ supabase, site_id: site.id }),
          ]);

          const payrolls = payrollsResult.data ?? [];
          // Check if we should add a recent payroll
          let addRecentPayroll =false;

          // Process existing payrolls
          const sitePayrolls = payrolls.map((payroll) => {
            if (payroll?.run_date?.startsWith(currentYearMonth))
              addRecentPayroll = false;
            return {
              ...site,
              runDate: payroll?.run_date,
              is_approved: payroll.status === "approved",
            } as SitesWithLocation & {
              runDate: string | null;
              is_approved: boolean;
            };
          });

          // Add recent payroll if needed
          if (addRecentPayroll) {
            sitePayrolls.push({
              ...site,
              runDate: "",
              is_approved: false,
            } as SitesWithLocation & {
              runDate: string | null;
              is_approved: boolean;
            });
          }

          return sitePayrolls;
        }),
      );

      // Flatten the array of arrays into a single array
      return processedSites.flat();
    });

    return defer({ dataPromise: siteDataPromise });
  } catch (error) {
    return defer({ dataPromise: Promise.reject(error) });
  }
}

export default function SitesIndex() {
  const { dataPromise } = useLoaderData<typeof loader>();

  return (
    <section className="p-4">
      <div className="w-full flex items-end justify-between">
        <Suspense
          fallback={
            <div className="w-full py-40 text-center">Loading sites...</div>
          }
        >
          <Await
            resolve={dataPromise}
            errorElement={
              <div className="w-full py-40 text-center text-destructive">
                Error loading sites. Please try again later.
              </div>
            }
          >
            {(data: any) => {
              const { isDocument } = useIsDocument();

              const isEarliestSiteDate = (site: {
                id: string;
                runDate: string;
              }) => {
                const earliestDate = data
                  .filter((entry: { id: string }) => entry.id === site.id)
                  .reduce(
                    (min: string, entry: { runDate: string }) =>
                      entry.runDate < min ? entry.runDate : min,
                    site.runDate,
                  );
                return site.runDate === earliestDate;
              };

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
                        {data?.map((site: any) => (
                          <CommandItem
                            key={site.id}
                            className="w-full data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
                          >
                            {!site.is_approved && (
                              <PayrollStatus
                                data={site}
                                disable={!isEarliestSiteDate(site)}
                              />
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

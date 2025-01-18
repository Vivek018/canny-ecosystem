import { getPayrollsBySiteId, getSitePaySequenceInSite, getSitesWithEmployeeCountByProjectId, type SitesWithLocation } from "@canny_ecosystem/supabase/queries";
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
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/react";
import { PayrollStatus } from "@/components/payroll/payroll-status";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId as string;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { data: siteData, error: siteError } = await getSitesWithEmployeeCountByProjectId({ supabase, projectId });

  const newSiteData: SitesWithLocation[] = [];
  await Promise.all(
    (siteData ?? []).map(async (site) => {
      const { data: payrolls } = await getPayrollsBySiteId({ supabase, site_id: site.id });
      const { data: sitePaySequenceData } = await getSitePaySequenceInSite({ supabase, siteId: site.id });

      // addRecentPayroll (boolean)-> add recent payroll only when today is sitePaySequenceData?.pay_day
      const currentDate = new Date();
      const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`; // 2025-01
      let addRecentPayroll = (sitePaySequenceData?.pay_day === currentDate.getDate());

      (payrolls ?? []).map((payroll) => {
        if (payroll?.run_date?.startsWith(currentYearMonth)) addRecentPayroll = false; 
        const payrollData = site as SitesWithLocation & { runDate: string | null, is_approved: boolean };
        payrollData.runDate = payroll?.run_date;
        payrollData.is_approved = (payroll.status === "approved");
        newSiteData.push(payrollData);
      });

      if (addRecentPayroll) {
        const payrollData = site as SitesWithLocation & { runDate: string | null, is_approved: boolean };
        payrollData.runDate = "";
        payrollData.is_approved = false;
        newSiteData.push(payrollData);
      }
    })
  );

  if (siteError) throw siteError;

  if (!newSiteData) throw new Error("No site data found");

  return json({ data: newSiteData });
}

export default function SitesIndex() {
  const { data } = useLoaderData<any>();

  const isEarliestSiteDate = (site: { id: string; runDate: string; }) => {
    const earliestDate = data
      .filter((entry: { id: string; }) => entry.id === site.id)
      .reduce((min: string, entry: { runDate: string; }) => entry.runDate < min ? entry.runDate : min, site.runDate);
    return (site.runDate === earliestDate);
  }

  const { isDocument } = useIsDocument();

  return (
    <section className='p-4'>
      <div className='w-full flex items-end justify-between'>
        <Command className='overflow-visible'>
          <div className='w-full md:w-3/4 lg:w-1/2 2xl:w-1/3 py-4 flex items-center gap-4'>
            <CommandInput
              divClassName='border border-input rounded-md h-10 flex-1'
              placeholder='Search Sites'
              autoFocus={true}
            />
          </div>
          <CommandEmpty
            className={cn(
              "w-full py-40 capitalize text-lg tracking-wide text-center",
              !isDocument && "hidden"
            )}
          >
            No site found.
          </CommandEmpty>
          <CommandList className='max-h-full py-2 overflow-x-visible overflow-y-visible'>
            <CommandGroup className='w-full p-0 overflow-visible'>
              <div className='flex-col'>
                {data?.map((site) => (
                  <CommandItem
                    key={site.id}
                    className='w-full data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0'
                  >
                    {!site.is_approved && <PayrollStatus data={site} disable={!isEarliestSiteDate(site)} />}
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
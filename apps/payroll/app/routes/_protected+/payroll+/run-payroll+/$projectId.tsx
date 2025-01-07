import { getPayrollBySiteId, getSitesWithEmployeeCountByProjectId, type SitesWithLocation } from "@canny_ecosystem/supabase/queries";
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
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/react";
import { PayrollStatus } from "@/components/payroll/payroll-status";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  const { supabase } = getSupabaseWithHeaders({ request });

  if (!projectId) throw new Error("No Project Id");

  const { data: siteData, error: siteError } = await getSitesWithEmployeeCountByProjectId({ supabase, projectId });

  const newSiteData: SitesWithLocation[] = [];
  await Promise.all(
    (siteData ?? []).map(async (site) => {
      const tmp = { ...site };
      const { data: payrolls } = await getPayrollBySiteId({ supabase, site_id: site.id });

      let add = true;
      const currentDate = new Date();
      const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      (payrolls ?? []).map((payroll) => {
        if (payroll?.run_date?.startsWith(currentYearMonth)) add = false;
        const payrollTmp = { ...tmp } as SitesWithLocation & { runDate: string | null, is_approved: boolean };
        payrollTmp.runDate = payroll?.run_date;
        payrollTmp.is_approved = (payroll.status === "approved");
        newSiteData.push(payrollTmp);
      });
      if (add) {
        const payrollTmp = { ...tmp } as SitesWithLocation & { runDate: string | null, is_approved: boolean };
        payrollTmp.runDate = "";
        payrollTmp.is_approved = false;
        newSiteData.push(payrollTmp);
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
                {data?.map((site:any) => (
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
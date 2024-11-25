import { LabourWelfareFundCard } from "@/components/statutory-fields/labour-welfare-fund/labour-welfare-fund-card";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getLabourWelfareFundsByCompanyId } from "@canny_ecosystem/supabase/queries";
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
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/react";


export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data, error } = await getLabourWelfareFundsByCompanyId({ supabase, companyId });

  if (error) throw error;

  return json({ data });
}

export default function LabourWelfareFundIndex() {
  const { data } = useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  return (
    <section className='py-4 px-4 w-full'>
      <div className='w-full flex items-end justify-between'>
        <Command className='overflow-visible'>
          <div className='w-full flex items-center gap-4'>
            <CommandInput
              divClassName='border border-input rounded-md h-10 flex-1'
              placeholder='Search labour welfare funds'
              autoFocus={true}
            />
            <Link
              to='create-labour-welfare-fund'
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1"
              )}
            >
              <span>Add</span>
              <span className='hidden md:flex justify-end'>
                Labour Welfare Fund
              </span>
            </Link>
          </div>
          <CommandEmpty
            className={cn(
              "w-full py-40 capitalize text-lg tracking-wide text-center",
              !isDocument && "hidden"
            )}
          >
            No labour welfare fund found.
          </CommandEmpty>
          <CommandList className='max-h-full py-6 overflow-x-visible overflow-y-visible'>
            <CommandGroup className='p-0 overflow-visible'>
              <div className='w-full grid gap-8 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3'>
                {data?.map((labourWelfareFund) => (
                  <CommandItem
                    key={labourWelfareFund.id}
                    value={
                      labourWelfareFund.state +
                      labourWelfareFund.employee_contribution +
                      labourWelfareFund.employer_contribution +
                      labourWelfareFund.deduction_cycle
                    }
                    className='data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0'
                  >
                    <LabourWelfareFundCard
                      labourWelfareFund={labourWelfareFund}
                    />
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

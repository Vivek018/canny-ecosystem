import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getProfessionalTaxesByCompanyId } from "@canny_ecosystem/supabase/queries";
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
import { ProfessionalTaxCard } from "@/components/statutory-fields/professional-tax/professional-tax-card";


export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data, error } = await getProfessionalTaxesByCompanyId({
    supabase,
    companyId,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No data found");
  }

  return json({ data });
}

export default function ProfessionalTaxIndex() {
  const { data } = useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  return (
    <section className='py-4 px-4'>
      <div className='w-full flex items-end justify-between'>
        <Command className='overflow-visible'>
          <div className='w-full flex items-center gap-4'>
            <CommandInput
              divClassName='border border-input rounded-md h-10 flex-1'
              placeholder='Search Professional Taxes'
              autoFocus={true}
            />
            <Link
              to='create-professional-tax'
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1"
              )}
            >
              <span>Add</span>
              <span className='hidden md:flex justify-end'>
                Professional Tax
              </span>
            </Link>
          </div>
          <CommandEmpty
            className={cn(
              "w-full py-40 capitalize text-lg tracking-wide text-center",
              !isDocument && "hidden"
            )}
          >
            No professional taxes found.
          </CommandEmpty>
          <CommandList className='max-h-full py-6 overflow-x-visible overflow-y-visible'>
            <CommandGroup className='p-0 overflow-visible'>
              <div className='w-full grid gap-8 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3'>
                {data?.map((professionalTax) => (
                  <CommandItem
                    key={professionalTax.id}
                    value={
                      professionalTax.state +
                      professionalTax.pt_number +
                      professionalTax.deduction_cycle + professionalTax.gross_salary_range?.toString()
                    }
                    className='data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0'
                  >
                    <ProfessionalTaxCard professionalTax={professionalTax} />
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

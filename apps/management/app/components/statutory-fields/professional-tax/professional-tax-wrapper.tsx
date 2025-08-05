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
import { Link } from "@remix-run/react";
import { ProfessionalTaxCard } from "./professional-tax-card";
import type { ProfessionalTaxDatabaseRow } from "@canny_ecosystem/supabase/types";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { hasPermission, createRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

export function ProfessionalTaxWrapper({
  data,
  error,
}: {
  data: Omit<ProfessionalTaxDatabaseRow, "created_at">[] | null;
  error: Error | null | { message: string };
}) {
  const { role } = useUser();
  const { isDocument } = useIsDocument();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(cacheKeyPrefix.professional_tax);
      toast({
        title: "Error",
        description: error.message || "Failed to load",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <section className="p-4">
      <div className="w-full flex items-end justify-between">
        <Command className="overflow-visible">
          <div className="w-full flex items-center gap-4">
            <CommandInput
              divClassName="border border-input rounded-md h-10 flex-1"
              placeholder="Search Professional Taxes"
              autoFocus={true}
            />
            <Link
              to="create-professional-tax"
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",
                !hasPermission(
                  role,
                  `${createRole}:${attribute.statutoryFieldsPf}`,
                ) && "hidden",
              )}
            >
              <span>Add</span>
              <span className="hidden md:flex justify-end">
                Professional Tax
              </span>
            </Link>
          </div>
          <CommandEmpty
            className={cn(
              "w-full py-40 capitalize text-lg tracking-wide text-center",
              !isDocument && "hidden",
            )}
          >
            No professional taxes found.
          </CommandEmpty>
          <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
            <CommandGroup className="p-0 overflow-visible">
              <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
                {data?.map((professionalTax) => (
                  <CommandItem
                    key={professionalTax?.id}
                    value={
                      professionalTax?.state +
                      professionalTax?.pt_number +
                      professionalTax?.deduction_cycle +
                      professionalTax?.gross_salary_range?.toString()
                    }
                    className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
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

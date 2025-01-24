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
import { LabourWelfareFundCard } from "./labour-welfare-fund-card";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { LabourWelfareFundDatabaseRow } from "@canny_ecosystem/supabase/types";
import { useEffect } from "react";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUserRole } from "@/utils/user";

export function LWFWrapper({
  data,
  error,
}: {
  data:
    | Omit<LabourWelfareFundDatabaseRow, "created_at" | "updated_at">[]
    | null;
  error: Error | null | { message: string };
}) {
  const { role } = useUserRole();
  const { isDocument } = useIsDocument();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <section className="p-4 w-full">
      <div className="w-full flex items-end justify-between">
        <Command className="overflow-visible">
          <div className="w-full flex items-center gap-4">
            <CommandInput
              divClassName="border border-input rounded-md h-10 flex-1"
              placeholder="Search labour welfare funds"
              autoFocus={true}
            />
            <Link
              to="create-labour-welfare-fund"
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",
                !hasPermission(`${role}`, `${updateRole}:statutory_fields_lwf`) &&
                  "hidden"
              )}
            >
              <span>Add</span>
              <span className="hidden md:flex justify-end">
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
          <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
            <CommandGroup className="p-0 overflow-visible">
              <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
                {data?.map((labourWelfareFund) => (
                  <CommandItem
                    key={labourWelfareFund.id}
                    value={
                      labourWelfareFund.state +
                      labourWelfareFund.employee_contribution +
                      labourWelfareFund.employer_contribution +
                      labourWelfareFund.deduction_cycle
                    }
                    className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
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

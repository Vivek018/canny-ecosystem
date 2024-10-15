import { DEFAULT_ROUTE } from "@/constant";
import { useCompanyId } from "@/utils/company";
import type { CompaniesDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Avatar, AvatarFallback } from "@canny_ecosystem/ui/avatar";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, useLocation, useSubmit } from "@remix-run/react";
import { useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@canny_ecosystem/ui/popover";
import { Button } from "@canny_ecosystem/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@canny_ecosystem/ui/command";
import { Icon } from "@canny_ecosystem/ui/icon";
import { replaceUnderscore } from "@canny_ecosystem/utils";

export const CompanySwitch = ({
  companies,
  className,
}: {
  companies: CompaniesDatabaseRow;
  className?: string;
}) => {
  const submit = useSubmit();
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();
  const companyId = useCompanyId();
  const [open, setOpen] = useState(false);

  const currentCompany = companies.find((company) => company.id === companyId);

  const onValueChange = (value: string) => {
    submit(
      { companyId: value, returnTo: DEFAULT_ROUTE },
      {
        method: "POST",
        action: "/cookie",
      },
    );
    setOpen(false);
  };

  return (
    <div
      key={location.key}
      className={cn("flex items-center relative", className)}
    >
      <Popover key={location.key} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "truncate justify-between capitalize rounded-full pl-3 pr-3 w-60 h-10 bg-secondary hover:bg-secondary/75 focus:bg-secondary/75",
              !currentCompany && "text-muted-foreground",
            )}
          >
            {currentCompany ? currentCompany.name : "Select a company"}
            <Icon
              name="caret-sort"
              size="sm"
              className="ml-2 shrink-0 opacity-50"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent sideOffset={10} align="start" className="p-0 w-64">
          <Command>
            <CommandInput placeholder="Search companies..." />
            <CommandEmpty className="w-full py-6 text-center">
              No company found.
            </CommandEmpty>
            <CommandList>
              <CommandGroup>
                {companies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.id + company.name}
                    onSelect={() => onValueChange(company.id)}
                    className="py-2 px-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <Avatar className="w-8 h-8 border border-muted-foreground/30 shadow-sm">
                        <AvatarFallback>
                          <span className="tracking-widest capitalize text-xs ml-[1.5px]">
                            {company.name.charAt(0)}
                          </span>
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium tracking-wide ml-1 truncate w-40">
                        {replaceUnderscore(company.name)}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="p-2 border-t">
            <Link
              ref={linkRef}
              to="/create-company"
              className={cn(
                buttonVariants({ variant: "primary-ghost" }),
                "w-full cursor-pointer capitalize",
              )}
              onClick={() => setOpen(false)}
            >
              Create Company
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
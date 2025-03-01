import { DEFAULT_ROUTE } from "@/constant";
import { useCompanyId } from "@/utils/company";
import type { CompanyDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Avatar, AvatarFallback, AvatarImage } from "@canny_ecosystem/ui/avatar";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, useLocation, useSubmit } from "@remix-run/react";
import { useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@canny_ecosystem/ui/popover";
import { Button } from "@canny_ecosystem/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@canny_ecosystem/ui/command";
import { Icon } from "@canny_ecosystem/ui/icon";
import { hasPermission, replaceUnderscore, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearAllCache } from "@/utils/cache";

export const CompanySwitch = ({ companies }: {
  companies: (CompanyDatabaseRow & {
    logo: string;
  })[]
}) => {
  const { role } = useUser();
  const submit = useSubmit();
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();
  const { companyId } = useCompanyId();
  const [open, setOpen] = useState(false);

  const currentCompany = companies.find((company) => company.id === companyId);

  const onValueChange = (value: string) => {
    clearAllCache();
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
    <Popover key={location.key} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={!hasPermission(role, `${updateRole}:${attribute.company}`)}
          className={cn(
            "bg-card truncate justify-between capitalize rounded pl-1.5 pr-3 w-72 h-12 disabled:opacity-100",
            !currentCompany && "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-2">
            <Avatar className="w-[34px] h-[34px] border border-muted-foreground/30 shadow-sm rounded-sm">
              <AvatarImage src={currentCompany?.logo} />
              <AvatarFallback className="rounded-sm">
                <span className="tracking-widest capitalize text-xs ml-[1.5px]">
                  {currentCompany?.name.charAt(0)}
                </span>
              </AvatarFallback>
            </Avatar>
            <p className="w-48 text-start truncate">
              {currentCompany ? currentCompany?.name : "Select a company"}
            </p>
          </div>
          <Icon
            name="caret-sort"
            size="md"
            className={cn(
              "ml-2 shrink-0 opacity-75",
              !hasPermission(role, `${updateRole}:${attribute.company}`) &&
              "hidden",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={10} align="end" className="p-0 w-72">
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
                  disabled={currentCompany?.id === company.id}
                  className={cn("py-2 px-2")}
                >
                  <div className="flex items-center gap-1.5">
                    <Avatar className="w-8 h-8 border border-muted-foreground/30 shadow-sm rounded-sm">
                      <AvatarImage src={company.logo} />
                      <AvatarFallback className="rounded-sm">
                        <span className="tracking-widest capitalize text-xs ml-[1.5px]">
                          {company.name.charAt(0)}
                        </span>
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium tracking-wide ml-1 truncate w-48">
                      {replaceUnderscore(company.name)}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="p-1.5 border-t">
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
  );
};

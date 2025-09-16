import { DEFAULT_ROUTE } from "@/constant";
import { useCompanyId } from "@/utils/company";
import type { CompanyDatabaseRow } from "@canny_ecosystem/supabase/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@canny_ecosystem/ui/avatar";
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
import {
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearAllCache } from "@/utils/cache";

export const CompanySwitch = ({
  companies,
}: {
  companies: Pick<CompanyDatabaseRow, "id" | "name" | "logo">[];
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
      }
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
            "bg-card truncate justify-between capitalize rounded pl-1.5 pr-3 w-auto py-1 h-full disabled:opacity-100",
            !currentCompany && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Avatar className="w-14 h-11 border border-muted-foreground/30 shadow-sm rounded-sm">
              <AvatarImage src={currentCompany?.logo ?? undefined} />
              <AvatarFallback className="rounded-sm">
                <span className="tracking-widest capitalize text-xs ml-[1.5px]">
                  {currentCompany?.name.charAt(0)}
                </span>
              </AvatarFallback>
            </Avatar>
            <p className="hidden md:flex w-56 text-start truncate">
              {currentCompany ? currentCompany?.name : "Select a company"}
            </p>
          </div>
          <Icon
            name="caret-sort"
            size="md"
            className={cn(
              "ml-2 shrink-0 opacity-75",
              !hasPermission(role, `${updateRole}:${attribute.company}`) &&
                "hidden"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={7} align="end" className="p-0 w-[350px]">
        <Command>
          <CommandInput className="h-12" placeholder="Search companies..." />
          <CommandEmpty className="w-full py-6 text-center">
            No company found.
          </CommandEmpty>
          <CommandList className="lg:max-h-96">
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.id + company.name}
                  onSelect={() => onValueChange(company.id)}
                  disabled={currentCompany?.id === company.id}
                  className={cn("py-1.5 px-2")}
                >
                  <div className="flex items-center gap-1.5">
                    <Avatar className="w-14 h-11 border border-muted-foreground/30 shadow-sm rounded-sm">
                      <AvatarImage src={company.logo ?? undefined} />
                      <AvatarFallback className="rounded-sm">
                        <span className="tracking-widest capitalize text-xs ml-[1.5px]">
                          {company.name.charAt(0)}
                        </span>
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium tracking-wide ml-1 truncate w-56">
                      {replaceUnderscore(company.name)}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="p-1 border-t-2">
          <Link
            ref={linkRef}
            to="/create-company"
            className={cn(
              buttonVariants({ variant: "primary-ghost" }),
              "w-full cursor-pointer capitalize h-11"
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

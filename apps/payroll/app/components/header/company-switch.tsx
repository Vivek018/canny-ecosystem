import { CREATE_COMPANY } from "@/routes/_company+/create-company";
import { useCompanyId } from "@/utils/company";
import type { CompaniesDatabaseRow } from "@canny_ecosystem/supabase/types";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "@canny_ecosystem/ui/select";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { replaceDash } from "@canny_ecosystem/utils";
import { Link, useLocation, useSubmit } from "@remix-run/react";
import { useRef } from "react";

export const CompanySwitch = ({
  companies,
  className,
}: { companies: CompaniesDatabaseRow; className?: string }) => {
  const submit = useSubmit();
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();
  const companyId = useCompanyId();
  const companyName = companies.find(
    (company) => company.id === companyId,
  )?.name;

  const onValueChange = (value: string) => {
    submit(
      { companyId: value, returnTo: location.pathname + location.search },
      {
        method: "POST",
        action: "/cookie",
      },
    );
  };

  return (
    <div className={cn("flex items-center relative", className)}>
      <Select
        key={location.key}
        defaultValue={companyId ?? ""}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-44 py-1.5 px-4 gap-2 rounded-full bg-secondary hover:bg-secondary/75 focus:bg-secondary/75 border-none capitalize h-10 text-sm tracking-wide">
          <p className="truncate">{companyName}</p>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {companies.map((company) => (
              <SelectItem
                key={company.id}
                value={company.id}
                className="py-2 w-44"
                onKeyDown={() => {
                  if (companies[companies.length - 1].id === company.id) {
                    linkRef.current?.focus();
                  }
                }}
              >
                <p className="w-44 truncate">{company.name}</p>
              </SelectItem>
            ))}
            <SelectSeparator />
            <Link
              ref={linkRef}
              to={`/${CREATE_COMPANY}`}
              className={cn(
                buttonVariants({ variant: "primary-ghost" }),
                "w-full cursor-pointer capitalize",
              )}
            >
              {replaceDash(CREATE_COMPANY)}
            </Link>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

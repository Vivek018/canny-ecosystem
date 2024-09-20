import { CREATE_COMPANY } from "@/routes/_company+/create-company";
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
import type { CompaniesDatabaseRow } from "types";

export const CompanySwitch = ({
  companies,
  className,
}: { companies: CompaniesDatabaseRow; className?: string }) => {
  const submit = useSubmit();
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();

  const onValueChange = (value: string) => {

  };

  return (
    <div className={cn("flex items-center relative", className)}>
      <Select
        key={location.key}
        defaultValue={companies[0].name}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full py-1.5 px-4 gap-2 rounded-full bg-transparent capitalize h-10 text-sm tracking-wide">
          {companies[0].name}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {companies.map((company) => (
              <SelectItem
                key={company.id}
                value={company.name}
                className="py-2"
                onKeyDown={() => {
                  if (companies[companies.length - 1].id === company.id) {
                    linkRef.current?.focus();
                  }
                }}
              >
                {company.name}
              </SelectItem>
            ))}
            <SelectSeparator />
            <Link
              ref={linkRef}
              to={`/${CREATE_COMPANY}`}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-primary hover:text-primary focus:text-primary cursor-pointer capitalize",
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

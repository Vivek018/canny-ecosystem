import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "@canny_ecosystem/ui/select";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSubmit } from "@remix-run/react";

const CREATE_COMPANY = "create company";

const companies = [
  {
    value: "company-1",
  },
  {
    value: "company-2",
  },
  {
    value: "company-3",
  },
];

export const CompanySwitch = ({ className }: { className?: string }) => {
  const submit = useSubmit();

  const onValueChange = (value: string) => {};

  return (
    <div className={cn("flex items-center relative", className)}>
      <Select defaultValue={companies[0].value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full py-1.5 px-4 gap-2 rounded-full bg-transparent capitalize h-10 text-sm tracking-wide">
          {"select Company"}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {companies.map((company) => (
              <SelectItem
                key={company.value}
                value={company.value}
                className="py-2"
              >
                {company.value}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem
              value={CREATE_COMPANY}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full text-primary hover:text-primary focus:text-primary capitalize",
              )}
            >
              {CREATE_COMPANY}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

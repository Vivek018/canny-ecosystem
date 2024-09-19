import { CREATE_COMPANY } from "@/constant";
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
import { useNavigate, useSubmit } from "@remix-run/react";

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
  const navigate = useNavigate();

  const onValueChange = (value: string) => {
    if (value === CREATE_COMPANY) {
      navigate("/create-company");
    }
  };

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
                "w-full text-primary hover:text-primary focus:text-primary cursor-pointer capitalize",
              )}
              noIcon={true}
            >
              {replaceDash(CREATE_COMPANY)}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

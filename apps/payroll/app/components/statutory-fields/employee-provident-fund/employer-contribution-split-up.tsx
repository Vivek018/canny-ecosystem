import { useLocation } from "@remix-run/react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@canny_ecosystem/ui/popover";
import { Icon } from "@canny_ecosystem/ui/icon";

export default function EmployerContributionSplitUp() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <Popover key={location.key} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span className="text-xs text-blue-600 cursor-pointer">
          (View splitup)
        </span>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={10}
        align="start"
        className="p-0 min-w-[30vw] text-[0.85rem]"
      >
        <div className="p-2 flex flex-col gap-4">
          <div className="px-2 pt-2 flex justify-between align-starts font-[600] text-gray-500 dark:text-gray-300">
            <h4>CONTRIBUTION RATE</h4>
          </div>

          <hr />

          <div className="px-2 flex justify-between align-start text-[0.75rem] font-[500] text-black dark:text-gray-400">
            <h4>SUB COMPONENTS</h4>
            <h4>EMPLOYER'S CONTRIBUTION</h4>
          </div>
          <hr />
        </div>

        <div className="px-5 pt-2 mb-4 flex flex-col justify-between gap-5 align-start text-[0.85rem] font-[500] text-black dark:text-gray-400">
          <div className="flex justify-between">
            <p> Employees' Provident Fund (EPF)</p>
            <p> 3.67% of PF Wage </p>
          </div>

          <div className="flex justify-between">
            <p> Employees' Pension Scheme </p>
            <p>
              {" "}
              8.33% of PF Wage{" "}
              <Icon name="info" size="sm" className="ml-0.5 cursor-pointer" />
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

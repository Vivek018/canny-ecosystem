import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@canny_ecosystem/ui/popover";

export function EmployerContributionSplitUp() {

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="text-xs text-primary inline-block cursor-pointer">
          (View splitup)
        </span>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={10}
        align="start"
        className="p-0 min-w-[30vw] text-sm"
      >
        <div className="p-2 flex flex-col gap-4">
          <div className="px-2 pt-2 flex justify-between align-starts font-semibold text-muted-foreground">
            <h4>CONTRIBUTION RATE</h4>
          </div>

          <hr />

          <div className="px-2 flex justify-between align-start text-xs text-muted-foreground">
            <h4>SUB COMPONENTS</h4>
            <h4>EMPLOYER'S CONTRIBUTION</h4>
          </div>
          <hr />
        </div>

        <div className="px-5 pt-2 mb-4 flex flex-col justify-between gap-5 align-start text-xs font-medium text-black dark:text-gray-400">
          <div className="flex justify-between">
            <p> Employees' Provident Fund (EPF)</p>
            <p> 3.67% of PF Wage </p>
          </div>

          <div className="flex justify-between">
            <p> Employees' Pension Scheme </p>
            <p>
              {" "}
              8.33% of PF Wage{" "}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import type { GroupedPayrollEntry } from "@/routes/_protected+/employees+/$employeeId+/salary";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { getMonthName, roundToNearest } from "@canny_ecosystem/utils";
import { useNavigate } from "@remix-run/react";

export default function SalaryInfoCard({
  salaryData,
}: {
  salaryData: GroupedPayrollEntry;
}) {
  let earningTotal = 0;
  let deductionTotal = 0;

  for (const key in salaryData?.fields) {
    const item = salaryData?.fields[key];
    if (item.type === "earning") {
      earningTotal += item.amount;
    } else if (item.type === "deduction") {
      deductionTotal += item.amount;
    }
  }

  const navigate = useNavigate();

  const handlePreviewSalarySlip = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    payrollId: string,
  ) => {
    e.preventDefault();
    navigate(`${payrollId}/salary-slip`);
  };
  return (
    <Card className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-between rounded-lg">
      <CardHeader className="grid grid-cols-2 py-2 px-3 gap-6">
        <CardTitle className="font-bold capitalize text-xl flex items-center gap-2">
          {getMonthName(salaryData?.month)} {salaryData?.year}
        </CardTitle>
        <CardTitle className="w-full flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "p-2 py-2 rounded-md bg-secondary grid place-items-center ",
              )}
            >
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={cn("py-2 text-[13px]")}
                  onClick={(e) => {
                    handlePreviewSalarySlip(e, salaryData?.payroll_id);
                  }}
                >
                  View Salary Slip
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>
      <div className="px-3 grid grid-cols-2 gap-6">
        <div className=" flex flex-col text-sm ">
          <div className="flex justify-between">
            <span>Presents Days</span>
            <span className="font-medium text-muted-foreground">
              {salaryData?.present_days}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Overtime Hours</span>
            <span className="font-medium text-muted-foreground  ">
              {salaryData?.overtime_hours}
            </span>
          </div>
        </div>
        <div className="w-full flex items-center text-sm">
          <div className="w-full flex justify-between ">
            <span className="font-bold">Net Amount</span>
            <span className="font-medium text-muted-foreground">
              ₹ {roundToNearest(earningTotal - deductionTotal)}
            </span>
          </div>
        </div>
      </div>
      <CardContent className="grid grid-cols-2 py-2 px-3 gap-6">
        <div className="flex flex-col">
          <h2 className="font-semibold text-green text-lg pb-1">Earnings</h2>
          <hr className="pb-1" />
          {Object.entries(salaryData?.fields)
            .filter(([, value]) => value.type === "earning")
            .map(([key, value]) => (
              <div key={key} className="flex justify-between py-0.5 text-xs">
                <span>{key}</span>
                <span className="font-semibold">₹ {value.amount}</span>
              </div>
            ))}
          <hr className="my-1" />

          <div className="flex justify-between py-0.5 text-xs">
            <span>Gross</span>
            <span className="font-semibold">
              ₹ {roundToNearest(earningTotal)}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="font-semibold text-destructive text-lg pb-1">
            Deductions
          </h2>
          <hr className="pb-1" />
          {Object.entries(salaryData?.fields)
            .filter(([, value]) => value.type === "deduction")
            .map(([key, value]) => (
              <div key={key} className="flex justify-between py-0.5 text-xs">
                <span>{key}</span>
                <span className="font-semibold">₹ {value.amount}</span>
              </div>
            ))}
          <hr className="my-1" />
          <div className="flex justify-between py-0.5 text-xs">
            <span>Deduction</span>
            <span className="font-semibold">
              ₹ {roundToNearest(deductionTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

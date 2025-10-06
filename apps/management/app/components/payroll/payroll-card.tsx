import type { PayrollDatabaseRow } from "@canny_ecosystem/supabase/types";
import { formatDate, getMonthName } from "@canny_ecosystem/utils";
import { Card, CardContent } from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";
import { DeletePayroll } from "./delete-payroll";
import { buttonVariants } from "@canny_ecosystem/ui/button";

export function PayrollCard({ data }: { data: PayrollDatabaseRow }) {
  const is_approved = data.status === "approved";

  return (
    <Card className="w-full select-text cursor-auto dark:border-[1.5px] flex flex-col justify-between">
      <CardContent className="h-full flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center flex-1 gap-2 md:gap-4 justify-start w-full">
          <div className="w-full md:w-52 text-sm tracking-wide flex flex-row md:flex-col justify-between md:justify-center items-center text-center">
            <h2 className="text-xs md:text-sm">Title</h2>
            <p className="p-2 w-auto font-bold text-xs md:text-sm rounded-md">
              {data?.title}
            </p>
          </div>

          <div className="text-sm tracking-wide flex flex-row md:flex-col justify-between md:justify-center items-center text-center w-full md:w-28">
            <span className="text-xs md:text-sm">Status</span>
            <p
              className={cn(
                "p-2 w-auto font-semibold text-center text-xs md:text-sm rounded-md capitalize",
                is_approved ? "bg-green" : "bg-muted",
              )}
            >
              {data.status}
            </p>
          </div>
          <div className="text-sm text-bolder tracking-wide flex flex-row md:flex-col justify-between md:justify-center items-center text-center w-full md:w-36">
            <h2 className="text-xs md:text-sm">No. Of Employees</h2>
            <p className="p-2 w-auto font-bold text-xs md:text-sm rounded-md">
              {data.total_employees}
            </p>
          </div>
          <div className="text-sm text-bolder tracking-wide flex flex-row md:flex-col justify-between md:justify-center items-center text-center w-full md:w-36">
            <h2 className="text-xs md:text-sm">Total Net Amount</h2>
            <p className="p-2 w-auto font-bold text-xs md:text-sm rounded-md">
              ₹{data.total_net_amount}
            </p>
          </div>
          <div className="hidden md:flex text-sm text-bolder tracking-wide flex-col justify-center items-center text-center w-28">
            <h2>Month</h2>
            <p className="p-2 w-auto font-bold text-sm rounded-md">
              {getMonthName(data.month!)}
            </p>
          </div>
          <div className="hidden md:flex text-sm text-bolder tracking-wide flex-col justify-center items-center text-center w-24">
            <h2>Year</h2>
            <p className="p-2 w-auto font-bold text-sm rounded-md">
              {data.year}
            </p>
          </div>
          <div className="hidden md:flex text-sm tracking-wide flex-col justify-center items-center text-center w-32">
            <h2>Run Date</h2>
            <p className="p-2 w-auto font-bold text-xs md:text-sm rounded-md">
              <> {formatDate(data.run_date ?? "-")}</>
            </p>
          </div>
          <div className="flex md:hidden text-sm text-bolder tracking-wide flex-row justify-between items-center text-center w-full">
            <h2 className="text-xs md:text-sm">Date</h2>
            <p className="p-2 font-bold text-xs md:text-sm">
              {getMonthName(data.month!)} {data.year} (
              {formatDate(data.run_date ?? "-")})
            </p>
          </div>
        </div>
        <div className="w-full md:w-auto flex flex-col gap-3">
          <Link
            prefetch="intent"
            to={
              is_approved
                ? `/payroll/payroll-history/${data.id}`
                : `/payroll/run-payroll/${data.id}`
            }
            className={cn(
              buttonVariants(),
              "border-2 border-primary w-full md:w-36",
            )}
          >
            View {is_approved ? "Pay History" : "Pay Run"}
          </Link>
          <DeletePayroll
            payrollId={data.id}
            className={cn(is_approved && "hidden", "w-full")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

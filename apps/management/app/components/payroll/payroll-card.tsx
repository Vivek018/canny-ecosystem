import type { PayrollDatabaseRow } from "@canny_ecosystem/supabase/types";
import { formatDate } from "@canny_ecosystem/utils";
import { Button } from "@canny_ecosystem/ui/button";
import { Card, CardContent } from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate } from "@remix-run/react";
import { DeletePayroll } from "./delete-payroll";

export function PayrollCard({
  data,
}: {
  data: Omit<PayrollDatabaseRow, "updated_at">;
}) {
  const navigate = useNavigate();

  const is_approved = data.status === "approved";

  const handleClick = () => {
    navigate(
      data?.status === "approved"
        ? `/payroll/payroll-history/${data.id}`
        : `/payroll/run-payroll/${data.id}`,
    );
  };

  return (
    <Card className="w-full select-text cursor-auto dark:border-[1.5px] flex flex-col justify-between">
      <CardContent className="h-full flex flex-row gap-0.5 justify-center items-center p-6">
        <div className="flex items-center flex-1 gap-10 justify-start">
          <div className="text-md tracking-wide flex-col justify-center items-center text-center">
            Type
            <p
              className={
                "p-2 w-auto font-semibold text-center text-base rounded-md capitalize"
              }
            >
              {data.payroll_type}
            </p>
          </div>
          <div className="text-md tracking-wide flex-col justify-center items-center text-center">
            Status
            <p
              className={cn(
                "p-2 w-auto font-semibold text-center text-sm rounded-md capitalize",
                is_approved ? "bg-green" : "bg-muted",
              )}
            >
              {data.status}
            </p>
          </div>
          <div className="text-md text-bolder tracking-wide flex-col justify-center items-center text-center">
            <h2>No. Of Employees</h2>
            <p className="p-2 w-auto font-bold text-md rounded-md">
              {data.total_employees}
            </p>
          </div>
          <div className="text-md text-bolder tracking-wide flex-col justify-center items-center text-center">
            <h2>Total Net Amount</h2>
            <p className="p-2 w-auto font-bold text-md rounded-md">
              ₹{data.total_net_amount}
            </p>
          </div>
          <div className="text-md tracking-wide flex-col justify-center items-center text-center">
            <h2>Created Date</h2>
            <p className="p-2 w-auto font-bold text-md rounded-md">
              {formatDate(data.created_at ?? "-")}
            </p>
          </div>
        </div>
        <div className="h-full flex flex-col items-center justify-between gap-3">
          <Button onClick={handleClick} className="border-2 border-primary">
            View {is_approved ? "Pay History" : "Pay Run"}
          </Button>
          <DeletePayroll
            payrollId={data.id}
            className={cn(is_approved && "hidden")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

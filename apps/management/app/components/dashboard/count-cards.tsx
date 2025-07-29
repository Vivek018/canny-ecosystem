import type {
  EmployeeDatabaseRow,
  ExitsRow,
  InvoiceDatabaseRow,
  PayrollDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export function CountCards({
  currentExits,
  previousExits,
  currentData,
  previousData,
  activeEmployeeCount,
  totalEmployeeCount,
  reimbursementCurrentData,
  reimbursementPreviousData,
}: {
  currentExits: ExitsRow[];
  previousExits: ExitsRow[];
  currentData: PayrollDatabaseRow[];
  previousData: PayrollDatabaseRow[];
  activeEmployeeCount: EmployeeDatabaseRow[];
  totalEmployeeCount: EmployeeDatabaseRow[];
  reimbursementCurrentData: InvoiceDatabaseRow[];
  reimbursementPreviousData: InvoiceDatabaseRow[];
}) {
  const currentResult = currentData.reduce(
    (acc: Record<string, number>, item) => {
      const type = "salary";
      acc[type] = (acc[type] || 0) + (item?.total_net_amount ?? 0);
      return acc;
    },
    {} as Record<string, number>,
  );
  const previousResult = previousData.reduce(
    (acc: Record<string, number>, item) => {
      const type = "salary";
      acc[type] = (acc[type] || 0) + (item?.total_net_amount ?? 0);
      return acc;
    },
    {} as Record<string, number>,
  );

  const reimbursementCurrentResult = reimbursementCurrentData.reduce(
    (acc: Record<string, number>, item: any) => {
      const type = "reimbursement";
      const amount = Number(item.payroll_data[0]?.amount ?? 0);
      acc[type] = (acc[type] || 0) + amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const reimbursementPreviousResult = reimbursementPreviousData.reduce(
    (acc: Record<string, number>, item: any) => {
      const type = "reimbursement";
      const amount = Number(item.payroll_data[0]?.amount ?? 0);
      acc[type] = (acc[type] || 0) + amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const salaryCalculation =
    ((Number(currentResult.salary ?? 0) - Number(previousResult.salary ?? 0)) /
      Number(previousResult.salary)) *
    100;

  const reimbursementCalculation =
    ((Number(reimbursementCurrentResult.reimbursement ?? 0) -
      Number(reimbursementPreviousResult.reimbursement ?? 0)) /
      Number(reimbursementPreviousResult.reimbursement)) *
    100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Salary Payment</CardTitle>
          <Icon name="rupees" size="xs" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentResult.salary ?? 0}</div>
          <p
            className={cn(
              "text-xs text-muted-foreground flex",
              (previousResult.salary ? salaryCalculation : 100) > 0
                ? "text-green"
                : "text-destructive",
            )}
          >
            {previousResult.salary
              ? Math.abs(salaryCalculation).toFixed(2)
              : currentResult.salary ?? 0}
            %
            <p className="text-xs text-muted-foreground ml-1">
              {(previousResult.salary ? salaryCalculation : 100) > 0
                ? "more"
                : "less"}{" "}
              than last month
            </p>
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Reimbursement Payment
          </CardTitle>
          <Icon name="rupees" size="xs" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {reimbursementCurrentResult.reimbursement ?? 0}
          </div>
          <p
            className={cn(
              "text-xs text-muted-foreground flex",
              (reimbursementPreviousResult.reimbursement
                ? reimbursementCalculation
                : 100) > 0
                ? "text-green"
                : "text-destructive",
            )}
          >
            {reimbursementPreviousResult.reimbursement
              ? Math.abs(reimbursementCalculation).toFixed(2)
              : reimbursementCurrentResult.reimbursement ?? 0}
            %
            <p className="text-xs text-muted-foreground ml-1">
              {(reimbursementPreviousResult.reimbursement
                ? reimbursementCalculation
                : 100) > 0
                ? "more"
                : "less"}{" "}
              than last month
            </p>
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Employees
          </CardTitle>
          <Icon name="employee" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeEmployeeCount.length}</div>
          <p className="text-xs text-muted-foreground">
            {totalEmployeeCount.length} total employees
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Exited Employees
          </CardTitle>
          <Icon name="employee" />
        </CardHeader>{" "}
        <CardContent>
          <div className="text-2xl font-bold">{currentExits.length}</div>
          <p
            className={cn(
              "text-xs text-muted-foreground flex",
              currentExits.length - previousExits.length > 0
                ? "text-green"
                : "text-destructive",
            )}
          >
            {currentExits.length - previousExits.length > 0
              ? currentExits.length - previousExits.length
              : previousExits.length - currentExits.length}
            <p className="text-xs text-muted-foreground ml-1">
              {currentExits.length - previousExits.length > 0 ? "more" : "less"}{" "}
              than last month
            </p>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

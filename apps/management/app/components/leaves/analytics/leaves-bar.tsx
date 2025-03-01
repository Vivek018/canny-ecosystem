import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@canny_ecosystem/ui/chart";
import { useMemo } from "react";
import type { LeavesDataType } from "@canny_ecosystem/supabase/queries";

const MAX_EMPLOYEES = 100;

const chartConfig = {
  leaves: {
    label: "Leaves",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function LeavesBars({ chartData }: { chartData: LeavesDataType[] }) {
  const trendData = useMemo(() => {
    const grouped: Record<string, number> = {};

    for (const row of chartData) {
      const employeeCode = row.employees.employee_code;
      const startDate = new Date(row.start_date);
      const endDate = row.end_date ? new Date(row.end_date) : startDate;

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        console.error("Invalid Date Detected:", row.start_date, row.end_date);
        continue;
      }

      const leaveDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;

      grouped[employeeCode] = (grouped[employeeCode] ?? 0) + leaveDays;
    }

    return Object.entries(grouped).map(([employee_code, leaves]) => ({
      employee_code,
      leaves,
    }));
  }, [chartData]);

  const limitedTrendData = trendData.slice(0, MAX_EMPLOYEES);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Leaves (Max Employees: {MAX_EMPLOYEES} )</CardTitle>
        <CardDescription>Showing total leaves per employee</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={limitedTrendData} width={600} height={300}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="employee_code" tickFormatter={(value) => value} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="leaves"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

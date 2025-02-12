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
import type { TransformedAteendanceDataType } from "@/routes/_protected+/time-tracking+/attendance+/_index";

const MAX_EMPLOYEES = 100;

const chartConfig = {
  presents: {
    label: "Presents",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AttendanceBars({
  chartData,
}: {
  chartData: TransformedAteendanceDataType[];
}) {
  const trendData = useMemo(() => {
    return chartData.map(({ employee_code, attendance }) => {
      const totalPresents = (attendance ?? []).reduce(
        (total: number, entry: { present: any }) =>
          total + (entry.present ? 1 : 0),
        0
      );

      return {
        employee_code,
        presents: totalPresents,
      };
    });
  }, [chartData]);

  const limitedTrendData = trendData
    .filter((employee) => employee.presents > 0)
    .slice(0, MAX_EMPLOYEES);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Employee Attendance (Max Employees: {MAX_EMPLOYEES} )
        </CardTitle>
        <CardDescription>Showing total presents per employee</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={limitedTrendData} width={600} height={300}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="employee_code" tickFormatter={(value) => value} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="presents"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

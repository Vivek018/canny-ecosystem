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

const MAX_EMPLOYEES = 100;

const chartConfig = {
  presents: {
    label: "Presents",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AttendanceBars({ chartData }: { chartData: any[] }) {
  const trendData = useMemo(() => {
    return chartData.map(({ employee_code, attendance_summary }) => {
      const totalPresents = attendance_summary?.present_days ?? 0;

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
          Employee Attendance (Max Employees: {MAX_EMPLOYEES})
        </CardTitle>
        <CardDescription>
          Showing total present days per employee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="w-full h-[300px]" config={chartConfig}>
          <BarChart data={limitedTrendData} width={600} height={200}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="employee_code" />
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

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
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

const chartConfig = {
  present_days: { label: "Present", color: "hsl(var(--chart-2))" },
  absent_days: { label: "Absent", color: "hsl(var(--chart-5))" },
  overtime_hours: { label: "Overtime Hours", color: "hsl(var(--chart-1))" },
  paid_leaves: { label: "Paid Leave", color: "hsl(var(--chart-4))" },
  casual_leaves: { label: "Casual Leave", color: "hsl(var(--chart-3))" },
  paid_holidays: { label: "Paid Holiday", color: "hsl(var(--chart-9))" },
} satisfies ChartConfig;

export function AttendanceTrend({ chartData }: { chartData: any[] }) {
  const totalData = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const field of Object.keys(chartConfig)) {
      totals[field] = 0;
    }

    for (const row of chartData) {
      const summary = row.attendance_summary;
      if (!summary) continue;

      for (const key of Object.keys(chartConfig)) {
        totals[key] += summary[key as keyof typeof summary] ?? 0;
      }
    }

    return Object.entries(totals).map(([key, value]) => ({
      name: chartConfig[key as keyof typeof chartConfig].label,
      key,
      value: (value / chartData.length).toFixed(2),
    }));
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company-wide Attendance Summary</CardTitle>
        <CardDescription>Showing average per attendance field</CardDescription>
      </CardHeader>
      <CardContent className="max-sm:pl-0">
        <ChartContainer className="w-full h-[300px]" config={chartConfig}>
          <BarChart data={totalData} width={600} height={300}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              label={{ position: "top" }}
            >
              {totalData.map((entry, index) => (
                <Cell
                  key={`cell-${index.toString()}`}
                  fill={
                    chartConfig[entry.key as keyof typeof chartConfig].color
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

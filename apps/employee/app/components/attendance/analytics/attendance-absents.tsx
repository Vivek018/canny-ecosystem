import { LabelList, RadialBar, RadialBarChart } from "recharts";

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
  absents: {
    label: "Absents",
  },
  employee_code: {
    label: "Employee",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AttendanceAbsentees({ chartData }: { chartData: any[] }) {
  const trendData = useMemo(() => {
    const grouped: Record<string, number> = {};

    for (const row of chartData) {
      const employee_code = row.employee_code;
      const totalAbsents = row.attendance_summary?.absent_days ?? 0;

      grouped[employee_code] = totalAbsents;
    }

    return Object.entries(grouped)
      .map(([employee_code, absents]) => ({ employee_code, absents }))
      .sort((a, b) => b.absents - a.absents)
      .slice(0, 5);
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Absentees</CardTitle>
        <CardDescription>Showing employees with max absents</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 pt-2">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={trendData}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="absents" />}
            />
            <RadialBar dataKey="absents" background fill="hsl(var(--chart-5))">
              <LabelList
                position="insideStart"
                dataKey="employee_code"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={10}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

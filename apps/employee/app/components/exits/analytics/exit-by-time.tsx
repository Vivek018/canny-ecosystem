import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@canny_ecosystem/ui/chart";
import type { ExitDataType } from "@canny_ecosystem/supabase/queries";

const chartConfig = {
  count: { label: "Count" },
  january: { label: "January", color: "hsl(var(--chart-1))" },
  february: { label: "February", color: "hsl(var(--chart-2))" },
  march: { label: "March", color: "hsl(var(--chart-3))" },
  april: { label: "April", color: "hsl(var(--chart-4))" },
  may: { label: "May", color: "hsl(var(--chart-5))" },
  june: { label: "June", color: "hsl(var(--chart-6))" },
  july: { label: "July", color: "hsl(var(--chart-7))" },
  august: { label: "August", color: "hsl(var(--chart-8))" },
  september: { label: "September", color: "hsl(var(--chart-9))" },
  october: { label: "October", color: "hsl(var(--chart-10))" },
  november: { label: "November", color: "hsl(var(--chart-11))" },
  december: { label: "December", color: "hsl(var(--chart-12))" },
} satisfies ChartConfig;

export function ExitByTime({ chartData }: { chartData: ExitDataType[] }) {
  const exitLastWorkingYears = new Set(
    chartData.map((row) => {
      const date = new Date(row.last_working_day || "");
      return date.getFullYear();
    }),
  );

  const exitsByTimeData: {
    year: number | null;
    count: number;
    month: string | null;
  }[] = [];

  if (exitLastWorkingYears.size > 1) {
    for (const year of exitLastWorkingYears) {
      const count = chartData.filter(
        (row) => new Date(row.last_working_day).getFullYear() === year,
      ).length;
      exitsByTimeData.push({ year, count, month: null });
    }
  } else {
    const groupedByMonth = chartData.reduce(
      (acc: Record<string, number>, row) => {
        const month = new Date(row.last_working_day).toLocaleString("default", {
          month: "long",
        });
        if (!acc[month]) acc[month] = 0;
        acc[month]++;
        return acc;
      },
      {},
    );

    for (const month in groupedByMonth) {
      exitsByTimeData.push({ month, count: groupedByMonth[month], year: null });
    }
  }

  const totalExitCount = React.useMemo(() => {
    return exitsByTimeData.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  let transformedChartData = [];

  if (exitLastWorkingYears.size > 1) {
    transformedChartData = exitsByTimeData.map((row, i) => ({
      ...row,
      year: row.year,
      fill: `hsl(var(--chart-${i + 1}))`,
    }));
  } else {
    transformedChartData = exitsByTimeData.map((row, i) => ({
      ...row,
      month: row.month?.toLowerCase(),
      fill: `hsl(var(--chart-${i + 1}))`,
    }));
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0 max-sm:text-sm">
        <CardTitle>Exit by Time</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={transformedChartData}
              dataKey="count"
              nameKey={exitLastWorkingYears.size > 1 ? "year" : "month"}
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalExitCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Exits
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing exits count for the time period.
        </div>
      </CardFooter>
    </Card>
  );
}

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
import { useMemo, useState } from "react";
import type { TransformedAteendanceDataType } from "@/routes/_protected+/time-tracking+/attendance+/_index";

const chartConfig = {
  presents: {
    label: "Presents",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AttendanceTrend({
  chartData,
}: {
  chartData: TransformedAteendanceDataType[];
}) {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("presents");

  const trendData = useMemo(() => {
    const grouped: Record<string, number> = {};

    for (const row of chartData) {
      const attendance = row.attendance ?? [];

      for (const entry of attendance as { date: string; present: boolean }[]) {
        if (entry.date) {
          const date = new Date(entry.date).toLocaleDateString("en-CA");
          grouped[date] = (grouped[date] ?? 0) + Number(entry.present ?? false);
        }
      }
    }

    const result = Object.entries(grouped).map(([date, presents]) => ({
      date,
      presents,
    }));

    return result.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [chartData]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6">
          <CardTitle>Attendance Trend Over Time</CardTitle>
          <CardDescription>
            Showing total presents over the period.
          </CardDescription>
        </div>
        <div className="flex">
          {["presents"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
                type="button"
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart]?.label}
                </span>
                {/* <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[chart]?.toLocaleString()}
                </span> */}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={trendData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[160px]"
                  nameKey="presents"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={chartConfig[activeChart].color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

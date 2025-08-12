import { LabelList, RadialBar, RadialBarChart } from "recharts";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@canny_ecosystem/ui/chart";
import type { TransformedAttendanceDataType } from "@/routes/_protected+/time-tracking+/attendance+/_index";

const chartConfig = {
  presents: {
    label: "Presents",
    color: "hsl(var(--chart-5))",
  },
  site: {
    label: "Site",
    color: "hsl(var(--chart-5))",
  },
} satisfies { [key: string]: { label: string; color?: string } };

export function AttendanceBySite({
  chartData,
}: {
  chartData: TransformedAttendanceDataType[];
}) {
  const trendData = useMemo(() => {
    const siteTotals = new Map<
      string,
      { totalPresents: number; count: number }
    >();

    for (const row of chartData) {
      const site = row.site || "Unknown";
      const presentDays = row.attendance_summary?.present_days ?? 0;

      if (!siteTotals.has(site)) {
        siteTotals.set(site, { totalPresents: 0, count: 0 });
      }

      const data = siteTotals.get(site)!;
      data.totalPresents += presentDays;
      data.count += 1;
    }

    return Array.from(siteTotals.entries())
      .map(([site, { totalPresents, count }]) => ({
        site,
        presents: count > 0 ? Number((totalPresents / count).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.presents - b.presents)
      .slice(0, 5);
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex items-center justify-center pt-3">
        <CardTitle>Site Attendance</CardTitle>
        <CardDescription>Top 5 sites by total present days</CardDescription>
      </CardHeader>

      {trendData.length > 0 ? (
        <CardContent className="flex-1 pb-0 pt-2">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart
              data={trendData}
              startAngle={-90}
              endAngle={270}
              innerRadius={30}
              outerRadius={130}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="presents" />}
              />
              <RadialBar
                dataKey="presents"
                background
                fill="hsl(var(--chart-2))"
              >
                <LabelList
                  position="insideStart"
                  dataKey="site"
                  className="fill-white capitalize mix-blend-luminosity"
                  fontSize={10}
                />
              </RadialBar>
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
      ) : (
        <div className="flex justify-center items-center text-muted-foreground mt-10">
          No attendance data available
        </div>
      )}
    </Card>
  );
}

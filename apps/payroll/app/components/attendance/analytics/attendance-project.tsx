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
import type { TransformedAteendanceDataType } from "@/routes/_protected+/time-tracking+/attendance+/_index";

const chartConfig = {
  presents: {
    label: "Presents",
    color: "hsl(var(--chart-5))",
  },
  project: {
    label: "Project",
    color: "hsl(var(--chart-5))",
  },
} satisfies { [key: string]: { label: string; color?: string } };

export function AttendanceByProjects({
  chartData,
}: {
  chartData: TransformedAteendanceDataType[];
}) {
  const trendData = useMemo(() => {
    return chartData
      .map((row) => {
        const totalPresents = (row.attendance ?? []).reduce(
          (count, entry: { present: boolean }) =>
            count + (entry.present ? 1 : 0),
          0,
        );

        return {
          project: row.projectName,
          presents: totalPresents,
        };
      })
      .sort((a, b) => b.presents - a.presents)
      .slice(0, 5);
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Project Attendance</CardTitle>
        <CardDescription>Attendance by project</CardDescription>
      </CardHeader>

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
            <RadialBar dataKey="presents" background fill="hsl(var(--chart-1))">
              <LabelList
                position="insideStart"
                dataKey="project"
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

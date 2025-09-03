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

export function AttendanceByProjects({ chartData }: { chartData: any[] }) {
  const trendData = useMemo(() => {
    const projectTotals = new Map<
      string,
      { totalPresents: number; count: number }
    >();

    for (const row of chartData) {
      const project = row.project || "Unknown";
      const presentDays = row.attendance_summary?.present_days ?? 0;

      if (!projectTotals.has(project)) {
        projectTotals.set(project, { totalPresents: 0, count: 0 });
      }

      const data = projectTotals.get(project)!;
      data.totalPresents += presentDays;
      data.count += 1;
    }

    return Array.from(projectTotals.entries())
      .map(([project, { totalPresents, count }]) => ({
        project,
        presents: count > 0 ? Number((totalPresents / count).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.presents - b.presents)
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

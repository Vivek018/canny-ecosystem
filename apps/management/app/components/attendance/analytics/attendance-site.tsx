import { LabelList, RadialBar, RadialBarChart } from "recharts";
import { useMemo, useState } from "react";

import { AttendanceProjectFilter } from "./attendance-project-filter";
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
  project: {
    label: "Site",
    color: "hsl(var(--chart-5))",
  },
} satisfies { [key: string]: { label: string; color?: string } };

export function AttendanceBySite({
  chartData,
  projectArray,
}: {
  chartData: TransformedAttendanceDataType[];
  projectArray: string[];
}) {
  const [project, setProject] = useState<string>();

  const trendData = useMemo(() => {
    const filteredData = chartData.filter((row) => row.project === project);

    if (filteredData.length === 0) return [];
    return filteredData
      .map((row) => {
        const totalPresents = (row.attendance ?? []).reduce(
          (count, entry) => count + (entry.present ? 1 : 0),
          0,
        );

        return {
          site: row.site,
          presents: totalPresents,
        };
      })
      .sort((a, b) => b.presents - a.presents)
      .slice(0, 5);
  }, [chartData, project]);

  return (
    <Card className="flex flex-col">
      <div className="flex justify-between p-2 relative items-start">
        <CardHeader className="flex-1 flex flex-col items-center pt-3">
          <CardTitle>Site Attendance</CardTitle>
          <CardDescription>
            {project
              ? `Attendance by site for ${project}`
              : "Select project to see attendance by sites"}
          </CardDescription>
        </CardHeader>
        <AttendanceProjectFilter
          projectArray={projectArray}
          setProject={setProject}
        />
      </div>
      {project ? (
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
          Select the Project first
        </div>
      )}
    </Card>
  );
}

import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@canny_ecosystem/ui/chart";
import { useRef, useState } from "react";

const chartConfig = {
  count: {
    label: "Active Employees",
  },
  site: {
    label: "Projects",
  },
} satisfies ChartConfig;

export function ActiveEmployeesBySite({ chartData }: { chartData: any[] }) {
  function groupByProjectAndSite(chartData: any[]) {
    const siteCounts: Record<string, Record<string, number>> = {};

    for (const item of chartData) {
      const project = item.employee_project_assignment?.sites?.projects?.name;
      const site = item.employee_project_assignment?.sites?.name;

      if (!site) continue; // Skip if site is missing

      const projectKey = project || site; // If no project, use site as project

      if (!siteCounts[projectKey]) {
        siteCounts[projectKey] = {};
      }

      siteCounts[projectKey][site] = (siteCounts[projectKey][site] || 0) + 1;
    }

    const finalData = Object.entries(siteCounts).map(
      ([project, sites], index) => {
        const totalCount = Object.values(sites).reduce((a, b) => a + b, 0);
        return {
          project,
          count: totalCount,
          fill: `hsl(var(--chart-${index + 1}))`,
          sites,
        };
      }
    );

    return finalData;
  }

  const finalData = groupByProjectAndSite(chartData);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <Card className="flex flex-col gap-20">
      <CardHeader className="items-center pb-0">
        <CardTitle>Employees by Project</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] w-full pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          ref={chartRef}
        >
          <PieChart>
            <ChartTooltip
              content={() => {
                if (activeIndex === null) return null;
                const projectData = finalData[activeIndex];
                return (
                  <div className="bg-black text-white px-3 py-2 rounded-md shadow flex flex-col gap-1 text-sm">
                    {Object.entries(projectData.sites).map(([site, count]) => (
                      <div
                        key={site}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: projectData.fill }}
                          />
                          <span>{site}</span>
                        </div>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
              wrapperStyle={{ zIndex: 1000 }}
              cursor={false}
            />
            <Pie
              data={finalData}
              dataKey="count"
              nameKey="project"
              stroke="0"
              labelLine={true}
              label={({ name }) => name}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {finalData.map((entry, index) => (
                <Cell key={`cell-${index.toString()}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Hover over a project to see site-wise active employees.
        </div>
      </CardFooter>
    </Card>
  );
}

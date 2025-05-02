import { Pie, PieChart } from "recharts";
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
  ChartTooltipContent,
} from "@canny_ecosystem/ui/chart";

const chartConfig = {
  count: {
    label: "Active Employees",
  },
  site: {
    label: "Sites",
  },
} satisfies ChartConfig;

export function ActiveEmployeesBySite({ chartData }: { chartData: any[] }) {
  const siteCounts: Record<string, number> = {};

  for (const item of chartData) {
    const site = item.employee_project_assignment?.project_sites?.name;
    if (site) {
      siteCounts[site] = (siteCounts[site] || 0) + 1;
    }
  }

  const finalData = Object.entries(siteCounts).map(([site, count], index) => ({
    site,
    count,
    fill: `hsl(var(--chart-${index + 1}))`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Employees by Site</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              wrapperStyle={{ width: "60%" }}
              cursor={false}
            />
            <Pie data={finalData} dataKey="count" nameKey="site" stroke="0" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing active employees by sites.
        </div>
      </CardFooter>
    </Card>
  );
}

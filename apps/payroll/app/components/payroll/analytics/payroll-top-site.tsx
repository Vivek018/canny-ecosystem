import { LabelList, RadialBar, RadialBarChart } from "recharts";

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

export function PayrollTopSite({ chartData }: { chartData: any[] | null }) {
  const chartConfig = chartData?.reduce(
    (acc, row) => {
      const site_name = row.project_sites.name;
      if (site_name) {
        if (!acc[site_name]) {
          acc[site_name] = { site_name: site_name, amount: 0 };
        }
        acc[site_name].amount += row.total_net_amount ?? 0;
      }
      return acc;
    },
    {} as Record<string, { site_name: string; amount: number }>,
  ) satisfies ChartConfig;

  const topSitePayrollData = Object.values(chartConfig)
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 4);
  if (Object.values(chartConfig).length > 5) {
    const othersAmount = Object.values(chartConfig)
      .slice(4)
      .reduce((acc, payroll: any) => acc + payroll.amount, 0);

    topSitePayrollData.push({ site_name: "Others", amount: othersAmount });
  }

  const transformedChartData = topSitePayrollData.map((row: any, i) => ({
    ...row,
    fill: `hsl(var(--chart-${i + 1}))`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top Sites Payroll</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={transformedChartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="site_name"
                  className="w-36 capitalize"
                />
              }
            />
            <RadialBar dataKey="amount" background>
              <LabelList
                position="insideStart"
                dataKey="site_name"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total payroll amount by site.
        </div>
      </CardFooter>
    </Card>
  );
}

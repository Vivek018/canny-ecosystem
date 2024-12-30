import { Pie, PieChart } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@canny_ecosystem/ui/chart";
import { employeeExitReasons } from "@canny_ecosystem/utils/constant";

const chartConfig = employeeExitReasons.reduce((config, reason, i) => {
  const key = reason.toLowerCase().replace(/\s+/g, "_");
  config[key] = {
    label: reason,
    color: `hsl(var(--chart-${i + 1}))`,
  };
  return config;
}, {} as ChartConfig);

chartConfig.amount = { label: "Amount" };

export function ExitByReasons({ chartData }: { chartData: { reason: string; amount: number }[] }) {

    const transformedChartData = chartData.map((data, i) => ({
        ...data,
        fill: `hsl(var(--chart-${i + 1}))`,
      }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Exit Payments by Reason</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="reason" />} wrapperStyle={{ width: "60%" }} />
            <Pie data={transformedChartData} dataKey="amount" />
            <ChartLegend
              content={<ChartLegendContent nameKey="reason" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

import { Pie, PieChart } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@canny_ecosystem/ui/chart";

const chartConfig = {
  amount: {
    label: "Total Amount",
  },
  deductible: {
    label: "Deductible",
    color: "hsl(var(--chart-1))",
  },
  nonDeductible: {
    label: "Non Deductible",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ReimbursementByDeductible({
  chartData,
}: { chartData: { type: string; amount: number }[] }) {

  const transformedChartData = chartData.map((data, i) => ({
    ...data,
    type:
      data.type === "deductible" ? "Deductible" : "Non Deductible",
    fill: `hsl(var(--chart-${i + 1}))`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Reimbursement by Deductible</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} wrapperStyle={{ width: "60%" }} cursor={false} />
            <Pie data={transformedChartData} dataKey="amount" nameKey="type" stroke="0" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing deductible and non-deductible ratio.
        </div>
      </CardFooter>
    </Card>  );
}

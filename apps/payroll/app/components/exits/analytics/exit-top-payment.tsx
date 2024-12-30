import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

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
import { exitPaymentFields } from "@canny_ecosystem/utils/constant";
import { replaceUnderscore } from "@canny_ecosystem/utils";

const chartConfig = Object.fromEntries(
  exitPaymentFields.map((field, i) => [
    field.toLowerCase().replace(/\s+/g, "_"),
    {
      label: field,
      color: `hsl(var(--chart-${i + 1}))`,
    },
  ]),
) as ChartConfig;

chartConfig.amount = {
  label: "Amount",
  color: "hsl(var(--background))",
};

export function ExitTopPayment({
  chartData,
}: { chartData: { amount: number; costType: string }[] }) {
  const transformedChartData = chartData.map((data, i) => ({
    ...data,
    costType: replaceUnderscore(data.costType.toLowerCase()),
    fill: `hsl(var(--chart-${i + 1}))`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Exits Top Payment</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-[60%]">
          <BarChart
            barSize={50}
            accessibilityLayer
            data={transformedChartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="costType"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="amount" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="amount"
              layout="vertical"
              fill="var(--color-amount)"
              radius={4}
            >
              <LabelList
                dataKey="costType"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="coastType"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing top exit payment for the time period.
        </div>
      </CardFooter>
    </Card>
  );
}

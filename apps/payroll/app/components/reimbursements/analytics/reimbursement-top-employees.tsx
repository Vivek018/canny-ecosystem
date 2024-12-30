import { TrendingUp } from "lucide-react";
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
import { replaceUnderscore } from "@canny_ecosystem/utils";

const chartConfig = {
  amount: {
    label: "Total Amount",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig;

export function ReimbursementTopEmployees({
  chartData,
}: { chartData: { employee_name: string; amount: number }[] }) {

  const transformChartData = chartData.map((row, i) => ({
    ...row,
    employee_name: replaceUnderscore(row.employee_name),
    fill: `hsl(var(--chart-${i+1}))`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Top Employees Reimbursements</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={transformChartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="employee_name"
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
              barSize={40}
            >
              <LabelList
                dataKey="employee_name"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="amount"
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
          Showing top employees reimbursement for the specific time period.
        </div>
      </CardFooter>
    </Card>
  );
}

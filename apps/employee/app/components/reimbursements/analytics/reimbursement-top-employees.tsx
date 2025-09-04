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
import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";

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
}: {
  chartData: ReimbursementDataType[];
}) {
  const employeeTotals = chartData.reduce(
    (acc, row) => {
      const employee_name = `${row?.employees?.first_name}_${row.employees?.middle_name || ""}_${row?.employees?.last_name}`;
      acc[employee_name] = (acc[employee_name] || 0) + (row.amount || 0);
      return acc;
    },
    {} as Record<string, number>,
  );

  const topEmployeesData = Object.entries(employeeTotals)
    .map(([employee_name, totalAmount]) => ({
      employee_name,
      amount: totalAmount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const transformChartData = topEmployeesData.map((row, i) => ({
    ...row,
    employee_name: replaceUnderscore(row.employee_name),
    fill: `hsl(var(--chart-${i + 1}))`,
  }));

  return (
    <Card>
      <CardHeader className="text-lg max-sm:text-sm">
        <CardTitle>Top Employees Reimbursements</CardTitle>
        <CardDescription className="max-sm:text-sm">
          Over the period
        </CardDescription>
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

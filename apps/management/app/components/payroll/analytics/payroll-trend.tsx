import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@canny_ecosystem/ui/chart";

const chartConfig = {
  date: {
    label: "Month",
    color: "hsl(var(--chart-0))",
  },
  amount: {
    label: "Total Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function PayrollTrend({ chartData }: { chartData: any[] | null }) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("amount");

  interface ChartDataItem {
    total_net_amount?: number;
  }

  interface ChartData {
    month: string;
    data: ChartDataItem[];
  }

  interface TrendData {
    month: string;
    amount: number;
  }

  const trendData: TrendData[] | undefined = chartData?.map(
    ({ month, data }: ChartData) => ({
      month,
      amount: data.reduce(
        (total, item: ChartDataItem) => total + (item.total_net_amount || 0),
        0
      ),
    })
  );
  const totalAmount = trendData?.reduce(
    (amount, item) => amount + item.amount,
    0
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Payroll Over Months</CardTitle>
          <CardDescription>
            Showing trend of payrolls for the period.
          </CardDescription>
        </div>
        <div className="flex">
          {["amount"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
                type="button"
              >
                <span className="text-xs text-muted-foreground">
                  Total Payroll Amount
                </span>
                <span>{totalAmount ?? 0}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={trendData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[160px]"
                  nameKey="amount"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

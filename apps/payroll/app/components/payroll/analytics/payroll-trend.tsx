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
import { PayrollDatabaseRow } from "@canny_ecosystem/supabase/types";

const chartConfig = {
  date: {
    label: "Date",
    color: "hsl(var(--chart-0))",
  },
  amount: {
    label: "Total Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function PayrollTrend({ chartData }: { chartData: Omit<PayrollDatabaseRow, "created_at" | "updated_at">[] | null }) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("amount");

  const years = new Set(
    chartData?.map((item) => new Date(item.run_date).getFullYear()),
  );

  let trendData: { date: string; amount: number }[] = [];

  if (years.size > 1) {
    trendData = Object.values(
      chartData?.reduce((acc, { run_date, total_net_amount }) => {
        const year = new Date(run_date).getFullYear();
        if (!acc[year]) {
          acc[year] = { date: year.toString(), amount: 0 };
        }
        acc[year].amount += total_net_amount;
        return acc;
      }, {}),
    );
  } else {
    trendData =
      chartData?.map((row) => ({
        date: row.run_date,
        amount: row.total_net_amount || 0,
      })) || [];
  }

  const total = React.useMemo(
    () => ({
      amount: trendData?.reduce((acc, curr) => acc + curr.amount, 0),
    }),
    [],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Payroll Over Time</CardTitle>
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
                  {chartConfig[chart]?.label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total]?.toLocaleString()}
                </span>
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
              dataKey="date"
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

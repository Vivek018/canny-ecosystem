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
import { reasonForExitArray, replaceUnderscore } from "@canny_ecosystem/utils";
import type { ExitDataType } from "@canny_ecosystem/supabase/queries";

const chartConfig = reasonForExitArray.reduce((config, reason, i) => {
  config[reason] = {
    label: replaceUnderscore(reason),
    color: `hsl(var(--chart-${i + 1}))`,
  };
  return config;
}, {} as ChartConfig);

chartConfig.amount = { label: "Amount" };

export function ExitByReasons({ chartData }: { chartData: ExitDataType[] }) {
  const exitByReasonsData = Object.values(
    chartData.reduce(
      (acc, row) => {
        const reason = row.reason.toLowerCase().replace(/\s+/g, "_") || "other";

        if (!acc[reason]) {
          acc[reason] = { reason, amount: 0 };
        }

        acc[reason].amount += row.total || 0;
        return acc;
      },
      Object.fromEntries(
        reasonForExitArray.map((reason) => {
          const normalizedReason = reason.toLowerCase().replace(/\s+/g, "_");
          return [normalizedReason, { reason: normalizedReason, amount: 0 }];
        }),
      ),
    ),
  );

  const transformedChartData = exitByReasonsData.map((data, i) => ({
    ...data,
    fill: `hsl(var(--chart-${i + 1}))`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Exit Payments by Reason</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="reason"
                  className="capitalize"
                />
              }
              wrapperStyle={{ width: "60%" }}
            />
            <Pie data={transformedChartData} dataKey="amount" />
            <ChartLegend
              content={<ChartLegendContent nameKey="reason" />}
              className="-translate-y-2 flex-wrap gap-2 capitalize [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

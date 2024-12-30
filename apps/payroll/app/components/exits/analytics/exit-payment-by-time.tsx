import { TrendingUp } from "lucide-react";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@canny_ecosystem/ui/chart";

const chartConfig = {
  amount: {
    label: "Amount",
    icon: TrendingUp,
  },
  january: {
    label: "January",
    color: "hsl(var(--chart-1))",
  },
  february: {
    label: "February",
    color: "hsl(var(--chart-2))",
  },
  march: {
    label: "March",
    color: "hsl(var(--chart-3))",
  },
  april: {
    label: "April",
    color: "hsl(var(--chart-4))",
  },
  may: {
    label: "May",
    color: "hsl(var(--chart-5))",
  },
  june: {
    label: "June",
    color: "hsl(var(--chart-6))",
  },
  july: {
    label: "July",
    color: "hsl(var(--chart-7))",
  },
  august: {
    label: "August",
    color: "hsl(var(--chart-8))",
  },
  september: {
    label: "September",
    color: "hsl(var(--chart-9))",
  },
  october: {
    label: "October",
    color: "hsl(var(--chart-10))",
  },
  november: {
    label: "November",
    color: "hsl(var(--chart-11))",
  },
  december: {
    label: "December",
    color: "hsl(var(--chart-12))",
  },
} satisfies ChartConfig;

export function ExitPaymentByTime({
  chartData,
  isYearly = false,
}: {
  chartData: { year: number | null; month: string | null; amount: number }[];
  isYearly?: boolean;
}) {
  let transformedChartData = [];

  if (isYearly) {
    transformedChartData = chartData.map((row, i) => ({
      ...row,
      year: row.year,
      fill: `hsl(var(--chart-${i + 1}))`,
    }));
  } else {
    transformedChartData = chartData.map((row, i) => ({
      ...row,
      month: row.month?.toLowerCase(),
      fill: `hsl(var(--chart-${i + 1}))`,
    }));
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Exit Payment by Time</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="w-full mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              wrapperStyle={{ width: "25%" }}
            />
            <Pie
              data={transformedChartData}
              dataKey="amount"
              label
              nameKey={isYearly ? "year" : "month"}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total exits for {isYearly ? "years" : "the year"}.
        </div>
      </CardFooter>
    </Card>
  );
}

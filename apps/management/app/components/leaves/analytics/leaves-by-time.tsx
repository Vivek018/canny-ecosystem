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
import type { LeavesDataType } from "@canny_ecosystem/supabase/queries";

const chartConfig = {
  leaves: {
    label: "leaves",
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

export function LeavesByTime({ chartData }: { chartData: LeavesDataType[] }) {
  const yearSet = new Set<number>();

  const leaveData = chartData.reduce(
    (acc, row) => {
      const startDate = new Date(row.start_date);
      const endDate = row.end_date ? new Date(row.end_date) : startDate;

      const currDate = new Date(startDate);
      while (currDate <= endDate) {
        const year = currDate.getFullYear();
        const monthName = currDate
          .toLocaleString("default", { month: "long" })
          .toLowerCase();

        yearSet.add(year);

        const key = yearSet.size > 1 ? `${year}` : monthName;

        if (!acc[key])
          acc[key] = { [yearSet.size > 1 ? "year" : "month"]: key, leaves: 0 };
        acc[key].leaves += 1;

        currDate.setDate(currDate.getDate() + 1);
      }

      return acc;
    },
    {} as Record<string, { year?: number; month?: string; leaves: number }>,
  );

  const transformedChartData = Object.values(leaveData).map((entry, i) => ({
    ...entry,
    fill: `hsl(var(--chart-${i + 1}))`,
  }));
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Leaves by Time</CardTitle>
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
              wrapperStyle={{ width: "60%" }}
            />
            <Pie
              data={transformedChartData}
              dataKey="leaves"
              nameKey={yearSet.size > 1 ? "year" : "month"}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total leaves for {yearSet.size > 1 ? "years" : "the year"}.
        </div>
      </CardFooter>
    </Card>
  );
}

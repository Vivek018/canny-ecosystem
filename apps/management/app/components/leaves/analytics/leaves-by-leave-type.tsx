import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
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

const chartConfig: any = {
  leaves: {
    label: "Leaves",
  },
  casual_leave: {
    label: "Casual Leave",
    color: "hsl(var(--chart-1))",
  },
  paid_leave: {
    label: "Paid Leave",
    color: "hsl(var(--chart-2))",
  },
  unpaid_leave: {
    label: "Unpaid Leave",
    color: "hsl(var(--chart-3))",
  },
  paternity_leave: {
    label: "Paternity Leave",
    color: "hsl(var(--chart-4))",
  },
  sick_leave: {
    label: "Sick Leave",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function LeavesByleaveType({
  chartData,
}: {
  chartData: LeavesDataType[];
}) {
  const leaveCounts = chartData.reduce((acc: Record<string, number>, row) => {
    acc[row?.leave_type!] = (acc[row.leave_type!] || 0) + 1;
    return acc;
  }, {});

  const transformedChartData = Object.entries(leaveCounts).map(
    ([type, count]) => ({
      type,
      leaves: count,
      fill: chartConfig[type].color,
    }),
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Leaves by leave type</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              wrapperStyle={{ width: "60%" }}
              cursor={false}
            />
            <Pie
              data={transformedChartData}
              dataKey="leaves"
              nameKey="type"
              stroke="0"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing leave types ratio.
        </div>
      </CardFooter>
    </Card>
  );
}

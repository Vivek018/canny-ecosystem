import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@canny_ecosystem/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@canny_ecosystem/ui/chart";
import type { ExitDataType } from "@canny_ecosystem/supabase/queries";

const chartConfig = {
  amount: { label: "Amount" },
  january: { label: "January", color: "hsl(var(--chart-1))" },
  february: { label: "February", color: "hsl(var(--chart-2))" },
  march: { label: "March", color: "hsl(var(--chart-3))" },
  april: { label: "April", color: "hsl(var(--chart-4))" },
  may: { label: "May", color: "hsl(var(--chart-5))" },
  june: { label: "June", color: "hsl(var(--chart-6))" },
  july: { label: "July", color: "hsl(var(--chart-7))" },
  august: { label: "August", color: "hsl(var(--chart-8))" },
  september: { label: "September", color: "hsl(var(--chart-9))" },
  october: { label: "October", color: "hsl(var(--chart-10))" },
  november: { label: "November", color: "hsl(var(--chart-11))" },
  december: { label: "December", color: "hsl(var(--chart-12))" },
} satisfies ChartConfig;

export function ExitPaymentByTime({ chartData }: { chartData: ExitDataType[] }) {
  const exitYears = new Set(chartData.map(row => new Date(row.final_settlement_date).getFullYear()));

  let exitByTimeData = [];

  if (exitYears.size > 1) {
    exitByTimeData = Object.values(
      chartData.reduce(
        (acc: Record<number, { year: number; amount: number; month: string | null }>, row:any) => {
          if (row.final_settlement_date) {
            const date = new Date(row.final_settlement_date);
            const year = date.getFullYear();

            if (!acc[year]) { acc[year] = { year, amount: 0, month: null } }
            acc[year].amount += row.bonus + row.leave_encashment + row.gratuity - row.deduction;
          }
          return acc;
        },
        {},
      ),
    );
  } else {
    exitByTimeData = Object.values(
      chartData.reduce(
        (acc: Record<string, { month: string; amount: number; year: number | null }>, row:any) => {
          if (row.final_settlement_date) {
            const date = new Date(row.final_settlement_date);
            const monthName = date.toLocaleString("default", { month: "long" });

            if (!acc[monthName]) { acc[monthName] = { month: monthName, amount: 0, year: null } }
            acc[monthName].amount += row.bonus + row.leave_encashment + row.gratuity - row.deduction;
          }
          return acc;
        },
        {},
      ),
    );
  }

  let transformedChartData = [];

  if (exitYears.size > 1) {
    transformedChartData = exitByTimeData.map((row, i) => ({
      ...row,
      year: row.year,
      fill: `hsl(var(--chart-${i + 1}))`,
    }));
  } else {
    transformedChartData = exitByTimeData.map((row, i) => ({
      ...row,
      month: row.month?.toLowerCase(),
      fill: `hsl(var(--chart-${i + 1}))`,
    }));
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Exit Payment by Time</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="w-full mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} wrapperStyle={{ width: "25%" }} />
            <Pie
              data={transformedChartData}
              dataKey="amount"
              label
              nameKey={exitYears.size > 1 ? "year" : "month"}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total exits for {exitYears.size > 1 ? "years" : "the year"}.
        </div>
      </CardFooter>
    </Card>
  );
}
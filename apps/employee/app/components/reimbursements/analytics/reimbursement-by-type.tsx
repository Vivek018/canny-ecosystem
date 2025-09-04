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
import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";

const chartConfig = {
  amount: {
    label: "Total Amount",
  },
  loan: {
    label: "Loan",
    color: "hsl(var(--chart-1))",
  },
  advances: {
    label: "Advances",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-3))",
  },
  rent: {
    label: "Rent",
    color: "hsl(var(--chart-4))",
  },
  vehicle: {
    label: "Vehicle",
    color: "hsl(var(--chart-5))",
  },
  vehicle_related: {
    label: "Vehicle Related",
    color: "hsl(var(--chart-6))",
  },
  others: {
    label: "Others",
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig;

export function ReimbursementByType({
  chartData,
}: {
  chartData: ReimbursementDataType[];
}) {
  const totalTypeData = Object.values(
    chartData.reduce(
      (acc: Record<string, { type: string; amount: number }>, row) => {
        const type = row.type!;
        if (!acc[type]) {
          acc[type] = { type, amount: 0 };
        }
        acc[type].amount += row.amount ?? 0;
        return acc;
      },
      {},
    ),
  );

  const transformedChartData = totalTypeData.map((data, i) => ({
    ...data,
    type: data.type,
    fill: `hsl(var(--chart-${i + 1}))`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0 max-sm:text-sm">
        <CardTitle>Reimbursement by Type</CardTitle>
        <CardDescription>Over the period</CardDescription>
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
              dataKey="amount"
              nameKey="type"
              stroke="0"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing reimbursements by types.
        </div>
      </CardFooter>
    </Card>
  );
}

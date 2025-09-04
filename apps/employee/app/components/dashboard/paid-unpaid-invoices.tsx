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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@canny_ecosystem/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  paid: {
    label: "Paid",
    color: "hsl(var(--chart-2))",
  },
  unPaid: {
    label: "Unpaid",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function InvoicePaidUnpaid({ chartData }: { chartData: any }) {
  interface TrendData {
    month: string;
    paid: number;
    unPaid: number;
  }

  const trendData: TrendData[] = chartData.map((monthItem: any) => {
    const paid = monthItem.data.filter((item: any) => item.is_paid).length;
    const unPaid = monthItem.data.filter((item: any) => !item.is_paid).length;

    return {
      month: monthItem.month,
      paid,
      unPaid,
    };
  });

  return (
    <Card className="col-span-2">
      <CardHeader className="max-sm:text-sm">
        <CardTitle className="text-center">Paid vs Unpaid Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="w-full h-[360px]" config={chartConfig}>
          <BarChart accessibilityLayer data={trendData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="paid"
              stackId="a"
              fill="var(--color-paid)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="unPaid"
              stackId="a"
              fill="var(--color-unPaid)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className=" flex flex-col items-start justify-center gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing Paid vs Unpaid Invoices for the selected period
        </div>
      </CardFooter>
    </Card>
  );
}

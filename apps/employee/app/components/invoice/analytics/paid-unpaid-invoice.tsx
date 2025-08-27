import type { InvoiceDataType } from "@canny_ecosystem/supabase/queries";
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
import { Pie, PieChart } from "recharts";

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

export function InvoicePaidUnpaid({
  chartData,
}: {
  chartData: InvoiceDataType[];
}) {
  const trendData = [
    {
      type: "paid",
      count: chartData.filter((invoice) => invoice.is_paid).length,
      fill: chartConfig.paid.color,
    },
    {
      type: "unPaid",
      count: chartData.filter((invoice) => !invoice.is_paid).length,
      fill: chartConfig.unPaid.color,
    },
  ];

  return (
    <Card className="flex flex-col gap-10">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-center">Paid vs Unpaid Analysis</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0 ">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground "
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              wrapperStyle={{ width: "60%", height: "60%" }}
              cursor={false}
            />
            <Pie data={trendData} dataKey="count" nameKey="type" stroke="0" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing number of Paid vs Unpaid invoices
        </div>
      </CardFooter>
    </Card>
  );
}

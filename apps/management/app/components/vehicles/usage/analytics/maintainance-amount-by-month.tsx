import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { ChartContainer, ChartTooltip } from "@canny_ecosystem/ui/chart";
import type { VehicleUsageDataType } from "@canny_ecosystem/supabase/queries";

export function MaintainanceAmountByMonth({
  chartData,
  chartConfig,
}: {
  chartData: VehicleUsageDataType[];
  chartConfig: any;
}) {
  const pieData = chartData.map((item) => ({
    month: chartConfig[item.month]?.label || `Month ${item.month}`,
    value: item.maintainance_amount,
    fill: chartConfig[item.month]?.color || `hsl(var(--chart-${item.month}))`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Maintainance Amount by Month</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">{data.month}:</span>
                      <span>{data.value.toLocaleString()} km</span>
                    </div>
                  </div>
                );
              }}
              wrapperStyle={{ width: "auto" }}
            />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="month"
              label={(entry) => entry.month}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing maintainance cost per month
        </div>
      </CardFooter>
    </Card>
  );
}

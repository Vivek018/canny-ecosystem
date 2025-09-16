import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import type { VehicleUsageDataType } from "@canny_ecosystem/supabase/queries";

const MAX_VEHICLES = 100;

const chartConfig = {
  kilometers: {
    label: "Kilometers",
    color: "hsl(var(--chart-1))",
  },
  fuel_in_liters: {
    label: "Fuel (L)",
    color: "hsl(var(--chart-2))",
  },
  fuel_amount: {
    label: "Fuel Amount",
    color: "hsl(var(--chart-3))",
  },
  toll_amount: {
    label: "Toll Amount",
    color: "hsl(var(--chart-4))",
  },
  maintainance_amount: {
    label: "Maintenance",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function VehicleUsageBars({
  chartData,
}: {
  chartData: VehicleUsageDataType[];
}) {
  const newData = Object.values(
    chartData.reduce((acc: any, data) => {
      const reg = data.vehicles.registration_number;

      if (!acc[reg]) {
        acc[reg] = {
          registration_number: reg,
          kilometers: 0,
          fuel_in_liters: 0,
          fuel_amount: 0,
          toll_amount: 0,
          maintainance_amount: 0,
        };
      }

      acc[reg].kilometers += data.kilometers || 0;
      acc[reg].fuel_in_liters += data.fuel_in_liters || 0;
      acc[reg].fuel_amount += data.fuel_amount || 0;
      acc[reg].toll_amount += data.toll_amount || 0;
      acc[reg].maintainance_amount += data.maintainance_amount || 0;

      return acc;
    }, {}),
  );

  const limitedData = newData.slice(0, MAX_VEHICLES);
  return (
    <Card>
      <CardHeader className="max-sm:text-sm">
        <CardTitle>
          Vehicle Usage Analytics (Max Vehicles: {MAX_VEHICLES})
        </CardTitle>
        <CardDescription>Usage Data by vehicle</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[360px]">
          <BarChart accessibilityLayer data={limitedData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="registration_number"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
            <Bar
              dataKey="kilometers"
              stackId="a"
              fill={chartConfig.kilometers.color}
              name={chartConfig.kilometers.label}
            />
            <Bar
              dataKey="fuel_in_liters"
              stackId="a"
              fill={chartConfig.fuel_in_liters.color}
              name={chartConfig.fuel_in_liters.label}
            />
            <Bar
              dataKey="fuel_amount"
              stackId="a"
              fill={chartConfig.fuel_amount.color}
              name={chartConfig.fuel_amount.label}
            />
            <Bar
              dataKey="toll_amount"
              stackId="a"
              fill={chartConfig.toll_amount.color}
              name={chartConfig.toll_amount.label}
            />
            <Bar
              dataKey="maintainance_amount"
              stackId="a"
              fill={chartConfig.maintainance_amount.color}
              name={chartConfig.maintainance_amount.label}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

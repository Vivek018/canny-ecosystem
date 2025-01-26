import { LabelList, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@canny_ecosystem/ui/chart";
import type { PayrollEntriesWithTemplateComponents } from "@canny_ecosystem/supabase/queries";


type ChartDataPoint = {
  name: string;
  amount: number;
  fill?: string;
}

const chartConfig: Record<string, { label: string; color?: string }> = {
  amount: {
    label: "Amount",
  },
  epf: {
    label: "EPF",
    color: "hsl(var(--chart-1))",
  },
  esi: {
    label: "ESI",
    color: "hsl(var(--chart-2))",
  },
  pt: {
    label: "PT",
    color: "hsl(var(--chart-3))",
  },
  statutory_bonus: {
    label: "SB",
    color: "hsl(var(--chart-4))",
  },
  lwf: {
    label: "LWF",
    color: "hsl(var(--chart-5))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-6))",
  },
} as const;

type StatutoryRatioProps = {
  chartData: PayrollEntriesWithTemplateComponents[];
}

export function StatutoryRatio({ chartData }: StatutoryRatioProps) {
  
  const totalStatutoryFields = chartData.reduce<Record<string, ChartDataPoint>>(
    (acc, row) => {
      const name = row.payment_template_components.target_type;

      if (name && name !== "payment_field") {
        if (!acc[name]) {
          acc[name] = { name, amount: 0 };
        }
        acc[name].amount +=
          row.payment_template_components.calculation_value ?? 0;
      }
      return acc;
    },
    {},
  );

  // Process the top statutory data
  const sortedData = Object.values(totalStatutoryFields).sort(
    (a, b) => b.amount - a.amount,
  );

  const topStatutoryData = sortedData.slice(0, 4);

  // Handle additional entries as "Others"
  if (sortedData.length > 4) {
    const othersAmount = sortedData
      .slice(4)
      .reduce((acc, item) => acc + item.amount, 0);

    topStatutoryData.push({
      name: "Others",
      amount: othersAmount,
    });
  }

  // Transform data for the chart
  const transformedChartData = topStatutoryData.map((row) => ({
    ...row,
    fill: `var(--color-${row.name.toLowerCase()})`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Statutory Ratio</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="amount"
                  hideLabel
                  className="w-40"
                />
              }
            />
            <Pie
              data={transformedChartData}
              dataKey="amount"
              cx="50%"
              cy="50%"
              outerRadius={80}
            >
              <LabelList
                dataKey="name"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: string) =>
                  chartConfig[value.toLowerCase()]?.label ?? value
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total statutory amount ratio.
        </div>
      </CardFooter>
    </Card>
  );
}

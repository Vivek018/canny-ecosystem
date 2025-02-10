import { LabelList, RadialBar, RadialBarChart } from "recharts";

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
    label: "Amount",
  },
  employer: {
    label: "Employer",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ReimbursementPerEmployer({
  chartData,
}: { chartData: ReimbursementDataType[] }) {
  const totalEmployerAmountData = chartData.reduce(
    (acc, row) => {
      const email = row?.users?.email;
      if (email) {
        if (!acc[email]) {
          acc[email] = { employer: email, amount: 0 };
        }
        acc[email].amount += row.amount ?? 0;
      }
      return acc;
    },
    {} as Record<string, { employer: string; amount: number }>,
  );
  
  const topUsersData = Object.values(totalEmployerAmountData)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  if (Object.values(totalEmployerAmountData).length > 5) {
    const othersAmount = Object.values(totalEmployerAmountData)
      .slice(4)
      .reduce((acc, user) => acc + user.amount, 0);

    topUsersData.push({ employer: "Others", amount: othersAmount });
  }

  const transformData = topUsersData.map((row, i) => ({
    ...row,
    fill: `hsl(var(--chart-${i + 1}))`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Reimbursement per Employer</CardTitle>
        <CardDescription>Over the period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={transformData}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="amount" />}
            />
            <RadialBar dataKey="amount" background>
              <LabelList
                position="insideStart"
                dataKey="employer"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total reimbursements approved by employers.
        </div>
      </CardFooter>
    </Card>
  );
}

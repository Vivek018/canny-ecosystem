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
import type { LeavesDataType } from "@canny_ecosystem/supabase/queries";

const chartConfig = {
  leaves: {
    label: "Leaves",
  },
  employer: {
    label: "Employer",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function LeavesPerEmployer({
  chartData,
}: {
  chartData: LeavesDataType[];
}) {
  const totalEmployerLeaveData = chartData.reduce(
    (acc, row) => {
      const email = row?.users?.email!;

      if (!acc[email]) {
        acc[email] = { employer: email, leaves: 0 };
      }
      acc[email].leaves += 1;

      return acc;
    },
    {} as Record<string, { employer: string; leaves: number }>,
  );

  const topUsersData = Object.values(totalEmployerLeaveData)
    .sort((a, b) => b.leaves - a.leaves)
    .slice(0, 4);

  if (Object.values(totalEmployerLeaveData).length > 5) {
    const othersLeaveCount = Object.values(totalEmployerLeaveData)
      .slice(4)
      .reduce((acc, user) => acc + user.leaves, 0);

    topUsersData.push({ employer: "Others", leaves: othersLeaveCount });
  }

  const transformData = topUsersData.map((row, i) => ({
    ...row,
    fill: `hsl(var(--chart-${i + 1}))`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Leaves per Employer</CardTitle>
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
              content={<ChartTooltipContent hideLabel nameKey="leaves" />}
            />
            <RadialBar dataKey="leaves" background>
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
          Showing total leaves approved by employers.
        </div>
      </CardFooter>
    </Card>
  );
}

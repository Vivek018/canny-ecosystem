import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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
import { useMemo, useState } from "react";
import type { InvoiceDataType } from "@canny_ecosystem/supabase/queries";

const chartConfig = {
  amount: {
    label: "Total Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function InvoiceTrend({
  chartData,
  companyRelations,
}: {
  chartData: InvoiceDataType[];
  companyRelations: any;
}) {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("amount");

  interface PayrollDataItem {
    type: string;
    field: string;
    amount: number | string;
  }

  interface TrendData {
    date: string;
    amount: number;
  }

  const trendData: TrendData[] = Object.values(
    (chartData as any[]).reduce(
      (acc: Record<string, { date: string; amount: number }>, invoice) => {
        const type = invoice.invoice_type;

        const totalGross: number =
          invoice.payroll_data
            ?.filter((item: PayrollDataItem) => item.type === "earning")
            ?.reduce(
              (sum: number, item: PayrollDataItem) => sum + Number(item.amount),
              0
            ) ?? 0;

        const beforeService: number =
          totalGross +
          Number(
            invoice.payroll_data?.find(
              (item: PayrollDataItem) =>
                item.field === "PF" || item.field === "EPF"
            )?.amount ?? 0
          ) +
          Number(
            invoice.payroll_data?.find(
              (item: PayrollDataItem) =>
                item.field === "ESIC" || item.field === "ESI"
            )?.amount ?? 0
          );

        const includedFields: string[] | undefined =
          companyRelations.include_service_charge
            ?.split(",")
            .map((f: string) => f.trim().toUpperCase());

        const sum: number = invoice.payroll_data
          ?.filter((item: PayrollDataItem) =>
            includedFields?.includes(item.field.toUpperCase())
          )
          ?.reduce(
            (acc: number, curr: PayrollDataItem) =>
              acc + Number(curr.amount ?? 0),
            0
          );

        const service_charge: number =
          type === "salary"
            ? invoice.include_charge
              ? (sum * companyRelations.service_charge) / 100
              : 0
            : invoice.include_charge
              ? (invoice.payroll_data.reduce(
                  (sum: number, item: PayrollDataItem) =>
                    sum + Number(item.amount),
                  0
                ) *
                  companyRelations.reimbursement_charge) /
                100
              : 0;

        const total: number =
          type === "salary"
            ? beforeService + service_charge
            : Number(invoice.payroll_data[0]?.amount ?? 0) + service_charge;

        const cgst: number =
          invoice.include_cgst && invoice.include_sgst && !invoice.include_igst
            ? (total * 9) / 100
            : 0;

        const sgst: number =
          invoice.include_cgst && invoice.include_sgst && !invoice.include_igst
            ? (total * 9) / 100
            : 0;

        const igst: number =
          !invoice.include_cgst && !invoice.include_sgst && invoice.include_igst
            ? (total * 18) / 100
            : 0;

        const grand_total: number = total + cgst + sgst + igst;

        const date = invoice.date;
        if (!acc[date]) {
          acc[date] = { date, amount: 0 };
        }
        acc[date].amount += grand_total;

        return acc;
      },
      {}
    )
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const total = useMemo(
    () => ({
      amount: trendData.reduce((acc, curr) => acc + (curr.amount || 0), 0),
    }),
    []
  );
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 text-base max-sm:text-sm">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-2">
          <CardTitle>Invoice Amount Trend Over Time</CardTitle>
          <CardDescription>
            Showing total Invoices amount over the period.
          </CardDescription>
        </div>
        <div className="flex">
          {["amount"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
                type="button"
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart]?.label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total]?.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pt-5">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={trendData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[160px]"
                  nameKey="amount"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

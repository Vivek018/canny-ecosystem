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
import { replaceUnderscore } from "@canny_ecosystem/utils";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

const chartConfig = {
  amount: {
    label: "Net Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function InvoicesByType({
  chartData,
  companyRelations,
}: {
  chartData: InvoiceDataType[];
  companyRelations: any;
}) {
  const partialData = (chartData as any[]).map((invoice) => {
    const type = invoice.type;

    const totalGross: number =
      invoice.payroll_data
        ?.filter((item: any) => item.type === "earning")
        ?.reduce((sum: number, item: any) => sum + Number(item.amount), 0) ?? 0;

    const beforeService: number =
      totalGross +
      Number(
        invoice.payroll_data?.find(
          (item: any) => item.field === "PF" || item.field === "EPF",
        )?.amount ?? 0,
      ) +
      Number(
        invoice.payroll_data?.find(
          (item: any) => item.field === "ESIC" || item.field === "ESI",
        )?.amount ?? 0,
      );

    const includedFields: string[] | undefined =
      companyRelations.include_service_charge
        ?.split(",")
        .map((f: string) => f.trim().toUpperCase());

    const sum: number = invoice.payroll_data
      ?.filter((item: any) =>
        includedFields?.includes(item.field.toUpperCase()),
      )
      ?.reduce((acc: number, curr: any) => acc + Number(curr.amount ?? 0), 0);

    const service_charge: number =
      type === "salary"
        ? invoice.include_charge
          ? (sum * companyRelations.service_charge) / 100
          : 0
        : invoice.include_charge
          ? (invoice.payroll_data.reduce(
              (sum: number, item: any) => sum + Number(item.amount),
              0,
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

    return {
      type: invoice.type,
      amount: grand_total,
    };
  });

  const trendData = ["salary", "reimbursement", "exit"].map((type) => {
    const totalAmount = partialData
      .filter((item) => item.type === type)
      .reduce((sum, item) => sum + item.amount, 0);

    return { type, amount: totalAmount };
  });

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle className="text-center">Invoices Amount by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="w-full h-64" config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={trendData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
              className="capitalize"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => replaceUnderscore(value)!}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total amounts by Reimbursement Types
        </div>
      </CardFooter>
    </Card>
  );
}

import { Pie, PieChart } from "recharts";
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
import type { InvoiceDataType } from "@canny_ecosystem/supabase/queries";

const chartConfig = {
  amount: {
    label: "Total Amount",
  },
} satisfies ChartConfig;

export function InvoicesByLocations({
  chartData,
  companyRelations,
}: {
  chartData: InvoiceDataType[];
  companyRelations: any;
}) {
  interface PayrollDataItem {
    type: string;
    field: string;
    amount: number | string;
  }

  interface TrendData {
    location: string;
    amount: number;
  }

  const trendData: TrendData[] = (chartData as any[]).map((invoice, index) => {
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
          (item: PayrollDataItem) => item.field === "PF" || item.field === "EPF"
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
        (acc: number, curr: PayrollDataItem) => acc + Number(curr.amount ?? 0),
        0
      );

    const service_charge: number =
      type === "salary"
        ? invoice.include_charge
          ? (sum * companyRelations.service_charge) / 100
          : 0
        : invoice.include_charge
          ? (invoice.payroll_data.reduce(
              (sum: number, item: PayrollDataItem) => sum + Number(item.amount),
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

    return {
      location: invoice?.company_locations?.name,
      amount: Number(grand_total.toFixed(2)),
      fill: `hsl(var(--chart-${index + 1}))`,
    };
  });

  return (
    <Card className="flex flex-col gap-10">
      <CardHeader className="items-center pb-0">
        <CardTitle>Invoices by Company Location</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              wrapperStyle={{ width: "85%" }}
              cursor={false}
            />
            <Pie
              data={trendData}
              dataKey="amount"
              nameKey="location"
              stroke="0"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing Invoice over Locations.
        </div>
      </CardFooter>
    </Card>
  );
}

import type { InvoiceDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import Papa from "papaparse";

export function ExportBar({
  rows,
  data,
  className,
}: {
  rows: number;
  data: InvoiceDataType[];
  className: string;
}) {
  const paidCount = (data: InvoiceDataType[]): number =>
    data.filter((invoice) => invoice.is_paid === true).length;

  const finalExportData = data.map((invoice) => {
    return {
      invoice_number: invoice?.invoice_number,
      date: invoice?.date,
      subject: invoice?.subject,
      company_location: invoice?.company_locations?.name,
      include_charge: invoice?.include_charge,
      include_cgst: invoice?.include_cgst,
      include_sgst: invoice?.include_sgst,
      include_igst: invoice?.include_igst,
      include_proof: invoice?.include_proof,
      is_paid: invoice?.is_paid,
      type: invoice?.invoice_type,
    };
  });

  const handleExport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const csv = Papa.unparse(finalExportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;

    link.setAttribute("download", `Invoices - ${formatDateTime(Date.now())}`);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "z-40 fixed bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-10 justify-between items-center p-2 text-sm border dark:border-muted-foreground/30 bg-card text-card-foreground",
        className
      )}
    >
      <div className="ml-2 flex items-center space-x-1 rounded-md">
        <p className="font-semibold">{rows} Selected</p>
      </div>
      <div className="h-full flex justify-center items-center gap-2">
        <div className="h-full tracking-wide font-medium rounded-full flex justify-between items-center px-6 border dark:border-muted-foreground/30 ">
          Paid : <span className="ml-1.5">{paidCount(data)}</span>
        </div>
        <Button
          onClick={handleExport}
          variant="default"
          size="lg"
          className="h-full rounded-full"
        >
          Export
        </Button>
      </div>
    </div>
  );
}

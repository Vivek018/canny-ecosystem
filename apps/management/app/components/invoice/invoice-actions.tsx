import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useNavigate } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useInvoiceStore } from "@/store/invoices";

export function InvoiceActions() {
  const { selectedRows } = useInvoiceStore();
  const navigate = useNavigate();

  return (
    <div className="space-x-2 hidden md:flex">
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-10 w-10 bg-muted/70 text-muted-foreground",
          !selectedRows?.length && "hidden"
        )}
        disabled={!selectedRows.length}
        onClick={() => navigate("/payroll/invoices/analytics")}
      >
        <Icon name="chart" className="h-[18px] w-[18px]" />
      </Button>
    </div>
  );
}

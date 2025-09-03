import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useNavigate } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useInvoiceStore } from "@/store/invoices";
import { ColumnVisibility } from "./column-visibility";

export function InvoiceActions({ isEmpty }: { isEmpty: boolean }) {
  const { selectedRows } = useInvoiceStore();
  const navigate = useNavigate();

  return (
    <div className="gap-4 flex">
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 bg-muted/70 text-muted-foreground",
            !selectedRows?.length && "hidden",
          )}
          disabled={!selectedRows.length}
          onClick={() => navigate("/payroll/invoices/analytics")}
        >
          <Icon name="chart" className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </div>
  );
}

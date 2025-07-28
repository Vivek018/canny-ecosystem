import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useNavigate, useSubmit } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useInvoiceStore } from "@/store/invoices";
import { ColumnVisibility } from "./column-visibility";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Input } from "@canny_ecosystem/ui/input";
import { Label } from "@canny_ecosystem/ui/label";
import {
  booleanArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import {
  Combobox,
} from "@canny_ecosystem/ui/combobox";

export function InvoiceActions({ isEmpty }: { isEmpty: boolean }) {
  const { selectedRows } = useInvoiceStore();
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const submit = useSubmit();

  const handleUpdateBulkInvoices = () => {
    const updates = selectedRows.map((entry: any) => {
      return {
        id: entry.id,
        is_paid: isPaid && isPaid.trim() !== "" ? isPaid : null,
        paid_date: paidDate && paidDate.trim() !== "" ? paidDate : null,
      };
    });

    clearCacheEntry(`${cacheKeyPrefix.payroll_invoice}`);
    submit(
      {
        invoicesData: JSON.stringify(updates),
        failedRedirect: "/payroll/invoices",
      },
      {
        method: "POST",
        action: "/payroll/invoices/update-bulk-invoices",
      }
    );
  };
  return (
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
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
        <div className="h-full">
          <AlertDialog>
            <AlertDialogTrigger
              className={cn(
                "bg-secondary rounded-md py-2 px-2.5",
                !selectedRows.length && "hidden"
              )}
            >
              <Icon name="edit" size="md" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Update Bulk Invoices</AlertDialogTitle>
                <AlertDialogDescription>
                  Update Bulk Invoices here
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Site</Label>
                  <Combobox
                    options={transformStringArrayIntoOptions(
                      booleanArray as unknown as string[]
                    )}
                    value={isPaid}
                    onChange={(e) => setIsPaid(e)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Paid Date</Label>
                  <Input
                    type="date"
                    onChange={(e) => setPaidDate(e.target.value)}
                  />
                </div>
              </div>
              <AlertDialogFooter className="pt-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={cn(buttonVariants({ variant: "default" }))}
                  onClick={handleUpdateBulkInvoices}
                >
                  Update
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

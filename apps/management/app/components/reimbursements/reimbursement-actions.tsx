import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useNavigate, useSubmit } from "@remix-run/react";
import { ColumnVisibility } from "./column-visibility";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useReimbursementStore } from "@/store/reimbursements";
import { ReimbursementAdd } from "./reimbursement-add-option";
import { ReimbursementMenu } from "./reimbursement-menu";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Label } from "@canny_ecosystem/ui/label";
import {
  reimbursementStatusArray,
  reimbursementTypeArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { Combobox } from "@canny_ecosystem/ui/combobox";

export function ReimbursementActions({
  isEmpty,
  env,
}: {
  isEmpty: boolean;
  env: any;
}) {
  const { selectedRows } = useReimbursementStore();
  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const submit = useSubmit();

  const handleUpdateBulkReimbursements = () => {
    const updates = selectedRows.map((entry: any) => {
      return {
        id: entry.id,
        status: status && status.trim() !== "" ? status : null,
        type: type && type.trim() !== "" ? type : null,
      };
    });

    clearCacheEntry(`${cacheKeyPrefix.reimbursements}`);
    submit(
      {
        reimbursementsData: JSON.stringify(updates),
        failedRedirect: "/approvals/reimbursements",
      },
      {
        method: "POST",
        action: "/approvals/reimbursements/update-bulk-reimbursements",
      },
    );
  };

  return (
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
        <ReimbursementAdd />
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 bg-muted/70 text-muted-foreground",
            !selectedRows?.length && "hidden",
          )}
          disabled={!selectedRows.length}
          onClick={() => navigate("/approvals/reimbursements/analytics")}
        >
          <Icon name="chart" className="h-[18px] w-[18px]" />
        </Button>
        <div className="h-full">
          <AlertDialog>
            <AlertDialogTrigger
              className={cn(
                "h-10 w-10 bg-muted/70 text-muted-foreground rounded border border-input",
                !selectedRows.length && "hidden",
              )}
            >
              <Icon name="edit" className="h-[18px] w-[18px]" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Update Bulk Reimbursements</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Status</Label>
                  <Combobox
                    options={transformStringArrayIntoOptions(
                      reimbursementStatusArray as unknown as string[],
                    )}
                    value={status}
                    onChange={(e) => setStatus(e)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Type</Label>
                  <Combobox
                    options={transformStringArrayIntoOptions(
                      reimbursementTypeArray as unknown as string[],
                    )}
                    value={type}
                    onChange={(e) => setType(e)}
                  />
                </div>
              </div>
              <AlertDialogFooter className="pt-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={cn(buttonVariants({ variant: "default" }))}
                  onClick={handleUpdateBulkReimbursements}
                >
                  Update
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <ReimbursementMenu
          env={env}
          selectedRows={selectedRows}
          className={
            selectedRows?.length
              ? "bg-muted/70 text-muted-foreground"
              : "hidden"
          }
        />
      </div>
    </div>
  );
}

import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useNavigate } from "@remix-run/react";
import { ColumnVisibility } from "./column-visibility";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useReimbursementStore } from "@/store/reimbursements";
import { ReimbursementAdd } from "./reimbursement-add-option";
import { ReimbursementMenu } from "./reimbursement-menu";

export function ReimbursementActions({
  isEmpty,
  env,
}: {
  isEmpty: boolean;
  env: any;
}) {
  const { selectedRows } = useReimbursementStore();
  const navigate = useNavigate();

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
            !selectedRows?.length && "hidden"
          )}
          disabled={!selectedRows.length}
          onClick={() => navigate("/approvals/reimbursements/analytics")}
        >
          <Icon name="chart" className="h-[18px] w-[18px]" />
        </Button>
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

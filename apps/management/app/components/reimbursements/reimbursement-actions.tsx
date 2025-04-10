import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useNavigate } from "@remix-run/react";
import { ColumnVisibility } from "./column-visibility";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useReimbursementStore } from "@/store/reimbursements";
import { ReimbursementMenu } from "./reimbursement-menu";

export function ReimbursementActions({ isEmpty }: { isEmpty: boolean }) {
  const { selectedRows } = useReimbursementStore();
  const navigate = useNavigate();

  return (
    <div className="space-x-2 hidden md:flex">
      <ColumnVisibility disabled={isEmpty} />
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
        selectedRows={selectedRows}
        className={
          selectedRows?.length ? "bg-muted/70 text-muted-foreground" : undefined
        }
      />
    </div>
  );
}

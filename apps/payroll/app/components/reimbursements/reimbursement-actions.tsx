import { useReimbursementStore } from "@/store/reimbursements";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate } from "@remix-run/react";

export function ReimbursementActions({ isEmpty }: { isEmpty: boolean }) {
  const { selectedRows } = useReimbursementStore();
  const navigate = useNavigate();

  return (
    <div className={cn("space-x-2 hidden md:flex", !selectedRows.length && "hidden md:hidden")}>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10"
        disabled={!selectedRows.length}
        onClick={() => navigate("/approvals/reimbursements/analytics")}
      >
        <Icon name="chart" className="h-[18px] w-[18px]" />
      </Button>
    </div>
  );
}

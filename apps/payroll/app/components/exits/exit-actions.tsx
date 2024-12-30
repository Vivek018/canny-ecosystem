import { useExitsStore } from "@/store/exits";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useNavigate } from "@remix-run/react";

export function ExitActions({ isEmpty }: { isEmpty: boolean }) {
  const { selectedRows } = useExitsStore();
  const navigate = useNavigate();

  return (
    <div className="space-x-2 hidden md:flex">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10"
        disabled={!selectedRows.length}
        onClick={() => navigate("/approvals/exits/analytics")}
      >
        <Icon name="chart" className="h-[18px] w-[18px]" />
      </Button>
    </div>
  );
}

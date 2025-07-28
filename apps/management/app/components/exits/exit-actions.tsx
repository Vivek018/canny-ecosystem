import { useExitsStore } from "@/store/exits";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useNavigate } from "@remix-run/react";
import { ColumnVisibility } from "./column-visibility";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { ExitAddOption } from "./exit-add-option";
import { ExitMenu } from "./exit-menu";

export function ExitActions({ isEmpty, env }: { isEmpty: boolean; env: any }) {
  const { selectedRows } = useExitsStore();
  const navigate = useNavigate();

  return (
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
        <ExitAddOption />
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 bg-muted/70 text-muted-foreground",
            !selectedRows.length && "hidden",
          )}
          disabled={!selectedRows.length}
          onClick={() => navigate("/approvals/exits/analytics")}
        >
          <Icon name="chart" className="h-[18px] w-[18px]" />
        </Button>
        <ExitMenu
          selectedRows={selectedRows}
          className={
            selectedRows?.length
              ? "bg-muted/70 text-muted-foreground"
              : "hidden"
          }
          env={env}
        />
      </div>
    </div>
  );
}

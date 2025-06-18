import { useExitsStore } from "@/store/exits";
import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Link, useNavigate } from "@remix-run/react";
import { ColumnVisibility } from "./column-visibility";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { ExitMenu } from "./exit-menu";

export function ExitActions({ isEmpty }: { isEmpty: boolean }) {
  const { selectedRows } = useExitsStore();
  const navigate = useNavigate();

  return (
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2 px-4 border-r border-dashed border-muted-foreground/80">
        <ColumnVisibility disabled={isEmpty} />
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 bg-muted/70 text-muted-foreground",
            !selectedRows.length && "hidden"
          )}
          disabled={!selectedRows.length}
          onClick={() => navigate("/approvals/exits/analytics")}
        >
          <Icon name="chart" className="h-[18px] w-[18px]" />
        </Button>
        <ExitMenu
          selectedRows={selectedRows}
          className={
            selectedRows?.length ? "bg-muted/70 text-muted-foreground" : undefined
          }
        />
      </div>
      <Link to="/chat/chatbox/payment" className={cn(buttonVariants({ variant: "gradiant" }), "flex items-center justify-center gap-2 h-10")}>
        <Icon name="magic" size="xs" />
        <p>AI Chat</p>
      </Link>
    </div>
  );
}

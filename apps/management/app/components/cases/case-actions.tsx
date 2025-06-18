import { ColumnVisibility } from "./column-visibility";
import { AddCaseDialog } from "./add-case-dialog";
import { Link } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";

export function CaseActions({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2 px-4 border-r border-muted-foreground/80">
      <ColumnVisibility disabled={isEmpty} />
      <AddCaseDialog />
      </div>
      <Link to="/chat/chatbox/events" className={cn(buttonVariants({ variant: "gradiant" }), "flex items-center justify-center gap-2 h-10")}>
        <Icon name="magic" size="xs" />
        <p>AI Chat</p>
      </Link>
    </div>
  );
}

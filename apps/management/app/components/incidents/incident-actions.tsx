import { Link } from "@remix-run/react";
import { ColumnVisibility } from "./column-visibility";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export function IncidentActions({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2 px-4 border-r border-dashed border-muted-foreground/80">
        <ColumnVisibility disabled={isEmpty} />
      </div>
      <Link to="/chat/chatbox/events" className={cn(buttonVariants({ variant: "gradiant" }), "flex items-center justify-center gap-2 h-10")}>
        <Icon name="magic" size="xs" />
        <p>AI Chat</p>
      </Link>
    </div>
  );
}

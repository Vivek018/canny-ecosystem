import { cn } from "@/utils";
import { Icon } from "./icon";

export function Logo({ className }: { className?: string }) {
  return <Icon name="logo" className={cn("w-9 h-9", className)} />;
}

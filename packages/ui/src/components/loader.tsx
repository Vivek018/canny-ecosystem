import { cn } from "@/utils";

export function Loader({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "w-8 h-8 border-4 border-b-secondary border-t-transparent rounded-full animate-spin",
          className,
        )}
      />
    </div>
  );
}

import { cn } from "@/utils";

const bars = Array(12).fill(0);

export const Spinner = ({ size = 16, className = "", barClassName = "" }) => {
  return (
    <div className={cn("loading-parent", className)}>
      <div
        className="loading-wrapper"
        data-visible
        style={{ "--spinner-size": `${size}px` } as any}
      >
        <div className="spinner">
          {bars.map((_, i) => (
            <div
              className={cn("loading-bar bg-muted-foreground", barClassName)}
              key={`spinner-bar-${i.toString()}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

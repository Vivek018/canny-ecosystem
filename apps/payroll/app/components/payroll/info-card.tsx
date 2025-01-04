import { Card } from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
type InfoCardProps = {
  heading: string;
  value: number;
  netDiff: number;
  isPercentage?: boolean;
};
export function InfoCard({
  heading,
  value,
  netDiff,
  isPercentage = true,
}: InfoCardProps) {
  return (
    <Card className="w-full p-4 flex flex-col gap-4 justify-between">
      <h2 className="text-muted-foreground font-semibold">{heading}</h2>
      <div className="flex justify-between">
        <p className="text-xl font-bold">{value}</p>
        <div className="flex">
          <span
            className={cn(
              " h-6 px-1  items-center font-bold ",
              netDiff >= 0
                ? "bg-green/25 text-green"
                : "bg-destructive/25 text-destructive",
            )}
          >
            {isPercentage ? `${netDiff.toFixed(1).toString()}%` : netDiff}
          </span>
          <p className="ml-2">
            {!isPercentage
              ? netDiff > 0
                ? "more employee/s"
                : "less employee/s"
              : "last month"}
          </p>
        </div>
      </div>
    </Card>
  );
}

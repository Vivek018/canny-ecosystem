
import React from "react";
import { Card, CardContent } from "@canny_ecosystem/ui/card";
import { roundToNearest } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";

interface PayrollSummaryProps {
  totals: Record<string, { amount: number; type: string } | number>;
  hasSelectedRows: boolean;
}

export const PayrollSummaryCard = React.memo<PayrollSummaryProps>(({
  totals,
  hasSelectedRows
}) => {
  const earningEntries = Object.entries(totals).filter(
    ([, value]: any) => value?.type === "earning"
  );
  const deductionEntries = Object.entries(totals).filter(
    ([, value]: any) => value?.type === "deduction"
  );

  const maxEntries = Math.max(earningEntries.length, deductionEntries.length);

  const renderEntries = (entries: any[], isEarning: boolean) => {
    const result = [];

    for (let i = 0; i < maxEntries; i++) {
      const entry = entries[i];
      if (entry) {
        const [key, value] = entry;
        result.push(
          <React.Fragment key={key}>
            <p>{key}</p>
            <p className="text-muted-foreground">
              {roundToNearest(value?.amount) || "0"}
            </p>
          </React.Fragment>
        );
      } else {
        result.push(
          <React.Fragment key={`empty-${isEarning ? 'earning' : 'deduction'}-${i}`}>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
          </React.Fragment>
        );
      }
    }

    return result;
  };

  const cardClassName = cn(
    "flex flex-col justify-around px-4 py-2",
    hasSelectedRows && "bg-muted"
  );

  const hrClassName = cn(
    hasSelectedRows && "border-muted-foreground/30"
  );

  return (
    <Card className={cardClassName}>
      <CardContent className="p-0 text-center">
        <div className="grid grid-cols-2 gap-x-4 text-sm">
          {/* Earnings Section */}
          <div className="text-center text-lg">
            Earnings
            <hr className={hrClassName} />
            <div className="grid grid-cols-2 gap-x-4 text-sm text-left py-2">
              {renderEntries(earningEntries, true)}
            </div>
            <hr className={hrClassName} />
            <p className="text-sm py-1">
              Gross: {roundToNearest(Number(totals.GROSS))}
            </p>
          </div>

          {/* Deductions Section */}
          <div className="text-center text-lg">
            Deductions
            <hr className={hrClassName} />
            <div className="grid grid-cols-2 gap-x-4 text-sm text-left py-2">
              {renderEntries(deductionEntries, false)}
            </div>
            <hr className={hrClassName} />
            <p className="text-sm py-1">
              Deduction: {roundToNearest(Number(totals.DEDUCTION))}
            </p>
          </div>
        </div>
        <hr className={hrClassName} />
        <p className="mt-2">
          Net Amount: {roundToNearest(Number(totals.TOTAL))}
        </p>
      </CardContent>
    </Card>
  );
});
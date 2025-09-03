import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { formatDate, getMonthName } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";

interface PayrollDetailsCardProps {
  payrollData: any;
}

export const PayrollDetailsCard = React.memo<PayrollDetailsCardProps>(
  ({ payrollData }) => {
    const payrollCardDetails = [
      { title: "Status", value: "status" },
      { title: `${getMonthName(payrollData.month!)}`, value: "year" },
      { title: "No of Employees", value: "total_employees" },
    ];

    return (
      <div className="hidden md:flex flex-col gap-2">
        <div className="relative h-full">
          <Card className="h-full flex flex-col justify-between px-4 py-3">
            <CardContent className="h-full p-0">
              <div
                className={cn(
                  payrollData?.site_id || payrollData?.project_id
                    ? "h-full grid grid-cols-3 gap-4"
                    : "h-full grid grid-cols-2 gap-4"
                )}
              >
                <div className="flex flex-col justify-around items-center">
                  <span>Title</span>
                  <span className="text-base font-medium text-muted-foreground break-words">
                    {payrollData?.title}
                  </span>
                </div>

                <div
                  className={cn(
                    "flex flex-col justify-around items-center",
                    !payrollData?.site_id &&
                      !payrollData?.project_id &&
                      "hidden"
                  )}
                >
                  <span>{payrollData?.site_id ? "Site" : "Project"}</span>
                  <span className="text-base font-medium text-muted-foreground break-words">
                    {payrollData?.site_id
                      ? `${payrollData?.sites?.name}`
                      : `${payrollData?.projects?.name}`}
                  </span>
                </div>
                <div className="flex flex-col justify-around items-center">
                  <span>Run Date</span>
                  <span className="text-base font-medium text-muted-foreground break-words">
                    {formatDate(payrollData?.run_date)?.toString() ?? ""}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-full grid grid-cols-3 gap-2">
          {payrollCardDetails.map((details, index) => (
            <Card
              key={index.toString()}
              className="flex flex-col justify-around pb-1"
            >
              <CardHeader className="p-0">
                <CardTitle className="text-lg text-center">
                  {details.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-0 px-2 text-muted-foreground text-center">
                <p
                  className={cn(
                    "text-wrap break-words whitespace-pre-wrap",
                    details.title === "Title" && "text-sm"
                  )}
                >
                  {payrollData[details.value as keyof typeof payrollData]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
);

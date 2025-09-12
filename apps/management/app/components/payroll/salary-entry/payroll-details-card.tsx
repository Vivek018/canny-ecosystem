import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@canny_ecosystem/ui/alert-dialog";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { Label } from "@canny_ecosystem/ui/label";
import {
  formatDate,
  getMonthName,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  Combobox,
  type ComboboxSelectOption,
} from "@canny_ecosystem/ui/combobox";

interface PayrollDetailsCardProps {
  payrollData: any;
  allProjectOptions: ComboboxSelectOption[];
  allSiteOptions: ComboboxSelectOption[];
  onUpdatePayroll: (
    title: string,
    rundate: string,
    link: string,
    linked: string,
  ) => void;
}

export const PayrollDetailsCard = React.memo<PayrollDetailsCardProps>(
  ({ payrollData, onUpdatePayroll, allProjectOptions, allSiteOptions }) => {
    const [title, setTitle] = useState(payrollData?.title);
    const [rundate, setRundate] = useState(payrollData?.run_date);
    const [link, setLink] = useState("");
    const [linked, setLinked] = useState("");

    const handleSubmit = () => {
      onUpdatePayroll(title, rundate!, link, linked);
    };

    const payrollCardDetails = [
      { title: "Status", value: "status" },
      { title: `${getMonthName(payrollData.month!)}`, value: "year" },
      { title: "No of Employees", value: "total_employees" },
    ];

    return (
      <div className="hidden md:flex flex-col gap-2">
        <div className="relative h-full">
          <Card className="h-full flex flex-col justify-between px-4 py-3">
            <div className="absolute top-2 right-2 z-10">
              <AlertDialog>
                <AlertDialogTrigger
                  className={cn(
                    "bg-secondary rounded-md px-1.5 pb-0.5",
                    payrollData.status !== "pending" && "hidden",
                  )}
                >
                  <Icon name="edit" size="xs" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Update Payroll</AlertDialogTitle>
                    <AlertDialogDescription>
                      Update the payroll here
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <Input
                        type="text"
                        placeholder="Enter the Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Run Date</Label>
                      <Input
                        type="date"
                        value={rundate!}
                        placeholder="Enter the Date"
                        onChange={(e) => setRundate(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-sm font-medium">Link With</Label>
                      <Combobox
                        options={transformStringArrayIntoOptions([
                          "site",
                          "project",
                          "unlink",
                        ] as unknown as string[])}
                        placeholder="Select"
                        value={link}
                        onChange={(e) => setLink(e)}
                      />
                    </div>
                    <div
                      className={cn(
                        "hidden",
                        link.length && "flex flex-col gap-1",
                        link === "unlink" && "hidden",
                      )}
                    >
                      <Label className="text-sm font-medium capitalize">
                        {link}
                      </Label>
                      <Combobox
                        options={
                          link === "site" ? allSiteOptions : allProjectOptions
                        }
                        placeholder={`Select ${link}`}
                        value={linked}
                        onChange={(e) => setLinked(e)}
                      />
                    </div>
                  </div>
                  <AlertDialogFooter className="pt-2">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className={cn(buttonVariants({ variant: "default" }))}
                      onClick={handleSubmit}
                    >
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <CardContent className="h-full p-0">
              <div
                className={cn(
                  payrollData?.site_id || payrollData?.project_id
                    ? "h-full grid grid-cols-3 gap-4"
                    : "h-full grid grid-cols-2 gap-4",
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
                      "hidden",
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
                    details.title === "Title" && "text-sm",
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
  },
);

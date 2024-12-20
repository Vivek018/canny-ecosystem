import { Button } from "@canny_ecosystem/ui/button";
import { Card, CardContent } from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";


export function PayrollStatus({ data }: { data: any }) {
  
  return (
    <Card className="w-full m-4 select-text cursor-auto dark:border-[1.5px] h-40 flex flex-col justify-between">
      <CardContent className="flex flex-row gap-0.5 justify-start items-center py-2 px-2">
        <div className="flex pt-6 px-4 items-center flex-1 gap-10 justify-start">
          <div className="text-md mx-3 text-bolder tracking-wide flex-col justify-center items-center text-center">
            <h2>Site</h2>
            <p className="p-2 mt-2 mx-2 w-auto font-bold text-md rounded-md">{data.name}</p>
          </div>
          <div className="text-md mx-3 text-bolder tracking-wide flex-col justify-center items-center text-center">
            Payroll status
            <p className={cn("p-2 mt-2 w-auto font-bold text-center text-muted-foreground text-sm rounded-md", data.is_approved ? "bg-green" : "bg-muted")}>
              {data.is_approved ? "Approved" : "Pending"}
            </p>
          </div>
          <div className="text-md mx-3 text-bolder tracking-wide flex-col justify-center items-center text-center">
            <h2>No. Of Employees</h2>
            <p className="p-2 mt-2 mx-3 pl-12 w-auto font-bold text-md rounded-md">
              {data.employees_count[0].count}
            </p>
          </div>
        </div>
        <Link to={data.is_approved ? `/payroll/payroll-history/site/${data.id}` : `/payroll/run-payroll/site/${data.id}`}>
          <Button className="px-4 mt-8 mx-7">{data.is_approved ? "View" : "Create"} Pay Run</Button>
        </Link>
      </CardContent>
      <div className={cn("my-2 mx-9 text-muted-foreground", data.is_approved ? "hidden" : "")} >You haven't processed this pay run yet !</div>
    </Card>
  );
}

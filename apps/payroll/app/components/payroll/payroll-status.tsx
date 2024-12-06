import { Button } from "@canny_ecosystem/ui/button";
import { Card, CardContent } from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";

type PayrollStatusProps = {
  data: any;
  
};
export function PayrollStatus({data}:PayrollStatusProps) {
    
  return (
    <Card className="w-fill m-4 select-text cursor-auto dark:border-[1.5px] h-40 flex flex-col justify-between">
      <CardContent className="flex flex-row gap-0.5 justify-start items-center py-2 px-2">
        <div className="flex pt-6 px-4 items-center flex-1 gap-10 justify-start">
          <div className="text-md mx-3 text-bolder tracking-wide flex-col justify-center items-center">
            EMPLOYEES's NET PAY
            <p className={cn("p-2 mt-2 w-auto font-bold  text-center text-muted-foreground text-sm  rounded-md", data.status==="YET TO BE PROCESS"? "bg-muted": "bg-green")}>
              {data.status}
            </p>
          </div>
          <div className="text-md mx-3 text-bolder tracking-wide flex-col justify-center items-center">
            <h2>PAYMENT DATE</h2>

            <p className="p-2 mt-2 mx-2 w-auto font-bold text-md  rounded-md">
              {data.date}
            </p>
          </div>
          <div className="text-md mx-3 text-bolder tracking-wide flex-col justify-center items-center">
            <h2>NO. OF EMPLOYEES</h2>
            <p className="p-2 mt-2 mx-3 pl-12 w-auto font-bold text-md  rounded-md">
              {data.number}
            </p>
          </div>
        </div>
        <Link to={"demo"}>
          <Button className="px-4 mt-8 mx-7">Create Pay Run</Button>
        </Link>
      </CardContent>
      <div className="my-2 mx-9 text-slate-400">
        You haven't processed this pay run yet !
      </div>
    </Card>
  );
}

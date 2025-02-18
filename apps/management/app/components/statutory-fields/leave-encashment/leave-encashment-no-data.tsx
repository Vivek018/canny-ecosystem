import { useUser } from "@/utils/user";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { hasPermission, createRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Link } from "@remix-run/react";

export function LeaveEncashmentNoData() {
  const { role } = useUser();
  return (
    <div className='flex flex-col items-center justify-end m-auto'>
      <div className='p-14' />
      <Card className='flex flex-col items-center justify-between gap-5 w-1/2 pt-6 px-2'>
        <CardContent className='flex flex-col items-center justify-between gap-5'>
          <CardTitle>Are you registered for Leave Encashment?</CardTitle>
          <CardDescription className='text-center text-[14px]'>
            Leave Encashment is a benefit that allows employees to receive
            monetary compensation for their unused paid leave. While not always
            a statutory requirement, it is often governed by company policies,
            labor laws, or industry regulations. In many cases, employees can
            encash their accumulated leave at the time of retirement,
            resignation, or under specific circumstances, such as extended
            service periods.
          </CardDescription>
        </CardContent>

        <CardFooter>
          <Link
            to='/payment-components/statutory-fields/leave-encashment/create-leave-encashment'
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              !hasPermission(
                `${role}`,
                `${createRole}:${attribute.statutoryFieldsLeaveEncashment}`
              ) && "hidden"
            )}
          >
            Enable Leave Encashment
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

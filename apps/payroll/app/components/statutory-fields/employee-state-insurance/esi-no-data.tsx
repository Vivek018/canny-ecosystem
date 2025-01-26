import { useUserRole } from "@/utils/user";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Link } from "@remix-run/react";

export function ESINoData() {
  const { role } = useUserRole();
  return (
    <div className="flex flex-col items-center justify-end m-auto">
      <div className="p-14" />
      <Card className="flex flex-col items-center justify-between gap-5 w-1/2 pt-6 px-2">
        <CardContent className="flex flex-col items-center justify-between gap-5">
          <CardTitle>Are you registered for ESI?</CardTitle>
          <CardDescription className="text-center text-[14px]">
            Organisations having 10 or more employees must register for Employee
            State Insurance (ESI). This scheme provides cash allowances and
            medical benefits for employees whose monthly salary is less than
            ₹21,000.
          </CardDescription>
        </CardContent>

        <CardFooter>
          <Link
            to="/payment-components/statutory-fields/employee-state-insurance/create-employee-state-insurance"
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              !hasPermission(
                role,
                `${updateRole}:${attribute.statutoryFieldsEsi}`
              ) && "hidden"
            )}
          >
            Enable ESI
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

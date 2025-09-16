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
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Link } from "@remix-run/react";

export function EPFNoData() {
  const { role } = useUser();
  return (
    <div className="flex items-center justify-center">
      <Card className="flex flex-col items-center justify-between gap-5 w-1/2 pt-6 px-2">
        <CardContent className="flex flex-col items-center justify-between gap-5">
          <CardTitle>Are you registered for EPF?</CardTitle>
          <CardDescription className="text-center text-[14px]">
            Any organisation with 20 or more employees must register for the
            Employee Provident Fund (EPF) scheme, a retirement benefit plan for
            all salaried employees.
          </CardDescription>
        </CardContent>

        <CardFooter>
          <Link
            to="/payment-components/statutory-fields/employee-provident-fund/create-employee-provident-fund"
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              !hasPermission(
                role,
                `${createRole}:${attribute.statutoryFieldsEpf}`
              ) && "hidden"
            )}
          >
            Enable EPF
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

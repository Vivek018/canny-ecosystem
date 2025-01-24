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
import { Link } from "@remix-run/react";

export function StatutoryBonusNoData() {
  const { role } = useUserRole();
  return (
    <div className="flex flex-col items-center justify-end m-auto">
      <div className="p-14" />
      <Card className="flex flex-col items-center justify-between gap-5 w-1/2 pt-6 px-2">
        <CardContent className="flex flex-col items-center justify-between gap-5">
          <CardTitle>
            Are your employees eligible to receive statutory bonus?
          </CardTitle>
          <CardDescription className="text-center text-[14px]">
            According to the Payment of Bonus Act, 1965, an eligible employee
            can receive a statutory bonus of 8.33% (min) to 20% (max) of their
            salary earned during a financial year. Configure statutory bonus of
            your organisation and start paying your employees.
          </CardDescription>
        </CardContent>

        <CardFooter>
          <Link
            to="/payment-components/statutory-fields/statutory-bonus/create-statutory-bonus"
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              !hasPermission(
                `${role}`,
                `${updateRole}:statutory_fields_statutory_bonus`
              ) && "hidden"
            )}
          >
            Enable Statutory Bonus
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

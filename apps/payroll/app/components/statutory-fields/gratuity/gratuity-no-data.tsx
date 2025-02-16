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

export function GratuityNoData() {
  const { role } = useUser();
  return (
    <div className="flex flex-col items-center justify-end m-auto">
      <div className="p-14" />
      <Card className="flex flex-col items-center justify-between gap-5 w-1/2 pt-6 px-2">
        <CardContent className="flex flex-col items-center justify-between gap-5">
          <CardTitle>Are you registered for Gratuity?</CardTitle>
          <CardDescription className="text-center text-[14px]">
            Gratuity is a statutory benefit under the Payment of Gratuity Act,
            1972, provided by employers to employees who have completed at least
            five years of continuous service. Organizations with 10 or more
            employees must register for the scheme, ensuring financial support
            for employees upon retirement, resignation, disability, or death.
          </CardDescription>
        </CardContent>

        <CardFooter>
          <Link
            to="/payment-components/statutory-fields/gratuity/create-gratuity"
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              !hasPermission(
                `${role}`,
                `${createRole}:${attribute.statutoryFieldsGraduity}`,
              ) && "hidden",
            )}
          >
            Enable Gratuity
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

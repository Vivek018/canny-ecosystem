import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Link } from "@remix-run/react";

export function GratuityNoData() {
  return (
    <div className="flex flex-col items-center justify-end m-auto">
        <div className="p-14" />
        <Card className="flex flex-col items-center justify-between gap-5 w-1/2 pt-6 px-2">
          <CardContent className="flex flex-col items-center justify-between gap-5">
            <CardTitle>Are you registered for Gratuity?</CardTitle>
            <CardDescription className="text-center text-[14px]">
              Any organisation with 20 or more employees must register for the
              Gratuity scheme, a retirement benefit plan
              for all salaried employees.
            </CardDescription>
          </CardContent>

          <CardFooter>
            <Link
              to="/payment-components/statutory-fields/gratuity/create-gratuity"
              className={buttonVariants({ variant: "primary-outline" })}
            >
              Enable Gratuity
            </Link>
          </CardFooter>
        </Card>
      </div>
  )
}
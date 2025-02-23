import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";

export default function ReportsIndex() {
  return (
    <section className="grid grid-cols-4 py-8">
      <div>
        <h1 className="flex items-center tracking-wide font-bold justify-between pb-4 text-xl">
          Gratuity Reports
        </h1>
        <Link
          to="gratuity"
          className={cn(buttonVariants({ variant: "link" }), "px-0")}
        >
          Gratuity Eligibility
        </Link>
      </div>

      <div>
        <h1 className="flex items-center tracking-wide font-bold justify-between pb-4 text-xl">
          Statutory Reports
        </h1>
        <div className="flex flex-col items-start">
          <Link
            to="/reports/epf"
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            EPF Summary
          </Link>

          <Link
            to="/reports/esi"
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            ESI Summary
          </Link>

          <Link
            to="/reports/pt"
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            PT Summary
          </Link>

          <Link
            to="/reports/lwf"
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            LWF Summary
          </Link>

          <Link
            to="/reports/statutory-bonus-yearly"
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            Statutory Bonus (Yearly)
          </Link>

          <Link
            to={"/reports/statutory-bonus-monthly"}
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            Statutory Bonus (Monthly)
          </Link>
        </div>
      </div>
    </section>
  );
}

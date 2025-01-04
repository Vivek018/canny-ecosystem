import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Link, Outlet } from "@remix-run/react";

export default function ReportsIndex() {
  return (
    <section className="py-6 px-6">
      <span className="flex items-center justify-between pb-4 text-xl">
        Payroll Overview
      </span>
      <Link
        to="/reports/gratuity"
        className={buttonVariants({ variant: "link" })}
      >
        Gratuity Eligibility
      </Link>
      <Outlet />
    </section>
  );
}

import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";

export default function ReportsIndex() {
  return (
    <section className="flex flex-col items-start  py-6 px-6">
      <h1 className="flex items-center tracking-wide font-bold justify-between pb-4 text-xl">
        Gratuity Reports
      </h1>
      <Link
        to="gratuity"
        className={cn(buttonVariants({ variant: "link" }), "px-0")}
      >
        Gratuity Eligibility
      </Link>
    </section>
  );
}

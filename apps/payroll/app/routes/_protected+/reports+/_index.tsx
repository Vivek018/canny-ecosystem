import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Link,
  Outlet,
} from "@remix-run/react";


export default function ProjectsIndex() {

  return (
    <section className='py-4 px-4'>
      <span className="flex items-center justify-between pb-4 font-semibold text-xl">Reports</span>
        <Link to="/reports/gratuity" className={buttonVariants({ variant: "link" })}>Gratuity Eligibility</Link>
      <Outlet />
    </section>
  );
}

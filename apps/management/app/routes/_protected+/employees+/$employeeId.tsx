import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link, Outlet, useLocation, useParams } from "@remix-run/react";

export default function Employee() {
  const { employeeId } = useParams();
  const { pathname } = useLocation();

  const items = [
    { label: "Overview", path: `/employees/${employeeId}/overview` },
    {
      label: "Work Portfolio",
      path: `/employees/${employeeId}/work-portfolio`,
    },
    {
      label: "Salary Slips",
      path: `/employees/${employeeId}/salary`,
    },
    { label: "Attendance", path: `/employees/${employeeId}/attendance` },
    {
      label: "Reimbursements",
      path: `/employees/${employeeId}/reimbursements`,
    },
    { label: "Documents", path: `/employees/${employeeId}/documents` },
    { label: "Letters", path: `/employees/${employeeId}/letters` },
    {
      label: "Leaves",
      path: `/employees/${employeeId}/leaves`,
    },
    { label: "Exit", path: `/employees/${employeeId}/payments` },
  ];

  return (
    <section className="relative">
      <div className="flex items-center gap-4 py-2.5 px-4 border-b">
        <Link
          prefetch="intent"
          to="/employees"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "bg-card w-9 h-9 px-0 rounded-full",
          )}
        >
          <Icon name="chevron-left" size="sm" />
        </Link>
        <SecondaryMenu items={items} pathname={pathname} Link={Link} />
      </div>
      <div className="px-4">
        <Outlet />
      </div>
    </section>
  );
}

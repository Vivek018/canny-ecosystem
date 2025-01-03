import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Outlet, useLocation, Link } from "@remix-run/react";

export default function Payroll() {
  const { pathname } = useLocation();
  return (
    <section className="flex flex-col h-full">
      <div className="py-[18px] px-4 border-b">
        <SecondaryMenu
          items={[
            {
              label: "Run Payroll",
              path: "/payroll/run-payroll",
            },
            {
              label: "Payroll History",
              path: "/payroll/payroll-history",
            },
          ]}
          pathname={pathname}
          Link={Link}
        />
      </div>
      <Outlet />
    </section>
  );
}

import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Outlet, useLocation, Link } from "@remix-run/react";

export default function Approvals() {
  const { pathname } = useLocation();
  return (
    <section className="flex flex-col h-full">
      <div className="py-[18px] px-4 border-b">
        <SecondaryMenu
          items={[
            {
              label: "Reimbursements",
              path: "/approvals/reimbursements",
            },

            {
              label: "Exits",
              path: "/approvals/exits",
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

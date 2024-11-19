import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Link, Outlet, useLocation } from "@remix-run/react";

export default function Account() {
  const { pathname } = useLocation();
  return (
    <section>
      <SecondaryMenu
        items={[
          { label: "Account", path: "/account" },
          { label: "Help", path: "/account/help" },
          { label: "Feedback", path: "/account/feedback" },
        ]}
        pathname={pathname}
        Link={Link}
      />
      <Outlet />
    </section>
  );
}

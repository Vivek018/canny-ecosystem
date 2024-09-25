import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Link, Outlet, useLocation } from "@remix-run/react";

export default function Settings() {
  const { pathname } = useLocation();

  return (
    <section>
      <SecondaryMenu
        items={[
          { label: "General", path: "/settings" },
          { label: "Users", path: "/settings/users" },
          { label: "Account", path: "/settings/account" },
        ]}
        pathname={pathname}
        Link={Link}
      />
      <Outlet />
    </section>
  );
}

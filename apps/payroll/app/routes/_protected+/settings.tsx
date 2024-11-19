import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Link, Outlet, useLocation } from "@remix-run/react";

export default function Settings() {
  const { pathname } = useLocation();

  return (
    <section>
      <SecondaryMenu
        items={[
          { label: "General", path: "/settings" },
          { label: "Locations", path: "/settings/locations" },
          { label: "Relationships", path: "/settings/relationships" },
          { label: "Users", path: "/settings/users" },
        ]}
        pathname={pathname}
        Link={Link}
      />
      <Outlet />
    </section>
  );
}

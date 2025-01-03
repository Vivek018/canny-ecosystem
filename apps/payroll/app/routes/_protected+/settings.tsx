import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Link, Outlet, useLocation } from "@remix-run/react";

export default function Settings() {
  const { pathname } = useLocation();

  return (
    <section>
      <div className="py-[18px] px-4 border-b">
        <SecondaryMenu
          items={[
            { label: "General", path: "/settings/general" },
            { label: "Locations", path: "/settings/locations" },
            { label: "Relationships", path: "/settings/relationships" },
            { label: "Users", path: "/settings/users" },
          ]}
          pathname={pathname}
          Link={Link}
        />
      </div>
      <div className="px-4">
        <Outlet />
      </div>
    </section>
  );
}

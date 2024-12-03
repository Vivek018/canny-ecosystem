import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { Link, Outlet, useLocation, useNavigation } from "@remix-run/react";

export default function Settings() {
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const isLoading =
    navigation.state === "loading" ||
    navigation.location?.pathname.startsWith("/settings");

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
        {isLoading ? (
          <div className="mt-20 flex items-center justify-center">
            <Spinner size={50} />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </section>
  );
}

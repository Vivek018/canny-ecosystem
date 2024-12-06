import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { Link, Outlet, useLocation, useNavigation } from "@remix-run/react";

export default function Account() {
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const isLoading =
    navigation.state === "loading" &&
    navigation.location?.pathname.startsWith("/user");

  return (
    <section>
      <div className="py-[18px] px-4 border-b">
        <SecondaryMenu
          items={[
            { label: "Account", path: "/user/account" },
            { label: "Help", path: "/user/help" },
            { label: "Feedback", path: "/user/feedback" },
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

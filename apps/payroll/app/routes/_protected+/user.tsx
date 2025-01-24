import { useUserRole } from "@/utils/user";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { Link, Outlet, useLocation } from "@remix-run/react";

export default function Account() {
  const { role } = useUserRole();
  const { pathname } = useLocation();

  return (
    <section className="flex flex-col h-full">
      <div className="py-[18px] px-4 border-b">
        <SecondaryMenu
          items={[
            { label: "Account", path: "/user/account" },
            { label: "Help", path: "/user/help" },
            { label: "Feedback Form", path: "/user/feedback-form" },
            hasPermission(role, `${readRole}:feedback_list`)
              ? { label: "Feedback List", path: "/user/feedback-list" }
              : {},
          ]}
          pathname={pathname}
          Link={Link}
        />
      </div>
      <div className="px-4 h-full">
        <Outlet />
      </div>
    </section>
  );
}

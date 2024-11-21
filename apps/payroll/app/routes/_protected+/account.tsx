import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { Link, Outlet, useLocation } from "@remix-run/react";

export default function Account() {
  const { pathname } = useLocation();
  return (
    <section>
      <div className='py-[18px] px-4 border-b'>
        <SecondaryMenu
          items={[
            { label: "Account", path: "/account" },
            { label: "Help", path: "/account/help" },
            { label: "Feedback", path: "/account/feedback" },
          ]}
          pathname={pathname}
          Link={Link}
        />
      </div>
      <div className='px-4'>
        <Outlet />
      </div>
    </section>
  );
}

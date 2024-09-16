import { sideNavList } from "@/constant";
import { CommonSidebar } from "@canny_ecosystem/ui/common-sidebar";
import { Link, NavLink, useLocation } from "@remix-run/react";

export function Sidebar({ className }: { className: string }) {
  const { pathname } = useLocation();
  return (
    <CommonSidebar
      className={className}
      list={sideNavList}
      path={pathname}
      Link={Link}
      NavLink={NavLink}
    />
  );
}

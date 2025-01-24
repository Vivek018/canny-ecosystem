import { statutorySideNavList } from "@/constant";
import { SecondarySidebar } from "@canny_ecosystem/ui/secondary-sidebar";
import { Outlet } from "@remix-run/react";


export default function StatutoryFields() {
  return (
    <div className="flex h-full">
      <SecondarySidebar
        items={statutorySideNavList}
        className="flex-shrink-0"
      />
      <div className="h-full w-full">
        <Outlet />
      </div>
    </div>
  );
}

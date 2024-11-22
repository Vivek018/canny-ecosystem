import { statutorySideNavList } from "@/constant";
import { SecondarySidebar } from "@canny_ecosystem/ui/secondary-sidebar";
import { Outlet } from "@remix-run/react";
import React from "react";

export default function StatutoryFields() {
  return (
    <div className="flex">
      <SecondarySidebar items={statutorySideNavList} />
      <Outlet />
    </div>
  );
};

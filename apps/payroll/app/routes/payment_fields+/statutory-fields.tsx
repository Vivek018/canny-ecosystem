import Sidebar from "@/components/statutory-fields/sidebar";
import { Outlet } from "@remix-run/react";
import React from "react";

const StatutoryFields = () => {
  return (
    <div className="flex">
      <Sidebar className="flex-none z-0" />
      <Outlet />
    </div>
  );
};

export default StatutoryFields;

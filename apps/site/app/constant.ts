import type { NavList } from "@canny_ecosystem/types";

export const DEFAULT_ROUTE = "/";

export const CANNY_MANAGEMENT_SERVICES_COMPANY_ID =
  "0638799b-6608-4326-8da0-8ac1fa38f0e7";

export const CANNY_MANAGEMENT_SERVICES_NAME = "Canny Management Services";

export const CANNY_MANAGEMENT_SERVICES_ADDRESS =
  "502-503, Girivar Glean, Under Odhav Overbrigde, Sardar Patel Ring Rd, nr. Palm Hotel, Odhav, Ahmedabad, Gujarat 382415";


export const sideNavList = [
  { name: "Dashboard", link: "/dashboard", icon: "dashboard" },
  { name: "Group 1" },
  { name: "Employees", link: "/employees", icon: "employee" },
  { name: "Group 2" },
  {
    name: "Time Tracking",
    link: "/time-tracking",
    icon: "lab-timer",
  },
  {
    name: "Payroll",
    link: "/payroll",
    icon: "table",
  },
  {
    name: "Payment Components",
    link: "/payment-components",
    icon: "input",
  },
  { name: "Group 3" },
  { name: "Approvals", link: "/approvals", icon: "check-circle" },
  { name: "Incidents", link: "/incidents", icon: "exclaimation-triangle" },
  { name: "Reports", link: "/reports", icon: "report" },
  { name: "Group 5" },
  { name: "Projects", link: "/projects", icon: "project" },
  {
    name: "Settings",
    link: "/settings",
    icon: "setting",
  },
] as NavList[];

export const cacheKeyPrefix = {
  root: "root",
  index: "index",
  protected: "protected",
};
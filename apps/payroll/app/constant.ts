import type { NavList } from "@canny_ecosystem/types";

export const sideNavList = [
  { name: "Dashboard", link: "/dashboard", icon: "dashboard" },
  { name: "Employees", link: "/employees", icon: "employee" },
  { name: "Advances", link: "/advances", icon: "lab-timer" },
  {
    name: "Payment Fields",
    link: "/payment_fields",
    icon: "input",
  },
  {
    name: "Payment Data",
    link: "/payment_data",
    icon: "table",
  },
  { name: "Projects", link: "/projects", icon: "project" },
  {
    name: "Locations",
    link: "/locations",
    icon: "pin",
  },
  {
    name: "Settings",
    link: "/settings",
    icon: "setting",
  },
] as NavList[];

export const navList = [
  ...sideNavList,
  { name: "Analytics", link: "/analytics", icon: "chart" },
  { name: "Users", link: "/users", icon: "avatar" },
  {
    name: "Profile",
    link: "/profile",
    icon: "person",
  },
  {
    name: "Add Users",
    link: "/users/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Employee",
    link: "/employees/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Document",
    link: "/documents/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Company",
    link: "/companies/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Advance Payment",
    link: "/advances/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Payment Field",
    link: "/payment_fields/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Project",
    link: "/projects/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Project Location",
    link: "/project_locations/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Vehicle",
    link: "/vehicles/upsert",
    icon: "plus-circled",
  },
] as NavList[];

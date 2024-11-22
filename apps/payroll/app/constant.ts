import type { NavList } from "@canny_ecosystem/types";

export const DEFAULT_ROUTE = "/";

export const workingDaysOptions = [
  { value: "0", label: "Sun" },
  { value: "1", label: "Mon" },
  { value: "2", label: "Tue" },
  { value: "3", label: "Wed" },
  { value: "4", label: "Thu" },
  { value: "5", label: "Fri" },
  { value: "6", label: "Sat" },
];

export const sideNavList = [
  { name: "Dashboard", link: "/dashboard", icon: "dashboard" },
  {name: "management"},
  { name: "Employees", link: "/employees", icon: "employee" },
  { name: "Finance" },
  { name: "Advances", link: "/advances", icon: "lab-timer" },
  {
    name: "Payment Fields",
    link: "/payment-fields",
    icon: "input",
  },
  {
    name: "Payment Data",
    link: "/payment_data",
    icon: "table",
  },
  { name: "General" },
  { name: "Projects", link: "/projects", icon: "project" },
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
    link: "/payment-fields/upsert",
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

export const statutorySideNavList = [
  {
    name: "EPF",
    link: "/payment-fields/statutory-fields/employee-provident-fund",
    icon: ""
  },
  {
    name: "ESI",
    link: "/payment-fields/statutory-fields/employee-state-insurance",
    icon: ""
  },
  {
    name: "Professional Tax",
    link: "/payment-fields/statutory-fields/professional-tax",
    icon: ""
  },
  {
    name: "Labour welfare fund",
    link: "/payment-fields/statutory-fields/labour-welfare-fund",
    icon: ""
  },
  {
    name: "Statutory Bonus",
    link: "/payment-fields/statutory-fields/statutory-bonus",
    icon: ""
  }
]
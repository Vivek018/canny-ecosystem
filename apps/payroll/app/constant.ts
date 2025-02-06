import type { NavList } from "@canny_ecosystem/types";
import {
  assignmentTypeArray,
  educationArray,
  genderArray,
  positionArray,
  skillLevelArray,
  statusArray,
} from "@canny_ecosystem/utils";

export const DEFAULT_ROUTE = "/";

export const CANNY_MANAGEMENT_SERVICES_COMPANY_ID =
  "0638799b-6608-4326-8da0-8ac1fa38f0e7";

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
  { name: "management" },
  { name: "Employees", link: "/employees", icon: "employee" },
  { name: "Finance" },
  {
    name: "Payroll",
    link: "/payroll",
    icon: "table",
  },
  { name: "Approvals", link: "/approvals", icon: "lab-timer" },
  {
    name: "Payment Components",
    link: "/payment-components",
    icon: "input",
  },
  { name: "Stats" },
  { name: "Reports", link: "/reports", icon: "report" },

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
    link: "/payment-components/payment-fields/upsert",
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

export const VALID_FILTERS = [
  {
    name: "name",
    valueType: "string",
    description:
      "Filter by the name, project name, site name, employee code and mobile number of the individual",
    example: [
      "John Doe",
      "Synthentica",
      "UABEADX",
      "Main Site",
      "Kota Site",
      "EMP123",
      "9876543210",
      "...",
    ],
  },
  {
    name: "dob_start",
    valueType: "date",
    description:
      "Filter for dates of birth on or after the specified date. Format: YYYY-MM-DD.",
    example: "1990-01-01",
  },
  {
    name: "dob_end",
    valueType: "date",
    description:
      "Filter for dates of birth on or before the specified date. Format: YYYY-MM-DD.",
    example: "2000-12-31",
  },
  {
    name: "gender",
    valueType: genderArray,
    description: "Filter by gender",
    example: "male",
  },
  {
    name: "education",
    valueType: educationArray,
    description: "Filter by the highest level of education.",
    example: "Bachelor's",
  },
  {
    name: "status",
    valueType: statusArray,
    description:
      "Filter by employment status. Example: 'active', 'inactive', 'terminated'.",
    example: "active",
  },
  {
    name: "project",
    valueType: "string",
    description: "Filter by project name or identifier.",
    example: "Project A",
  },
  {
    name: "project_site",
    valueType: "string",
    description: "Filter by the project site location or name.",
    example: "Site B",
  },
  {
    name: "assignment_type",
    valueType: assignmentTypeArray,
    description:
      "Filter by type of assignment. Example: 'full-time', 'part-time', 'contract'.",
    example: "full-time",
  },
  {
    name: "position",
    valueType: positionArray,
    description: "Filter by job position or title.",
    example: "Software Engineer",
  },
  {
    name: "skill_level",
    valueType: skillLevelArray,
    description: "Filter by skill level. Example: 'junior', 'mid', 'senior'.",
    example: "senior",
  },
  {
    name: "doj_start",
    valueType: "date",
    description:
      "Filter for dates of joining on or after the specified date. Format: YYYY-MM-DD.",
    example: "2020-01-01",
  },
  {
    name: "doj_end",
    valueType: "date",
    description:
      "Filter for dates of joining on or before the specified date. Format: YYYY-MM-DD.",
    example: "2023-12-31",
  },
  {
    name: "dol_start",
    valueType: "date",
    description:
      "Filter for dates of leaving on or after the specified date. Format: YYYY-MM-DD.",
    example: "2022-01-01",
  },
  {
    name: "dol_end",
    valueType: "date",
    description:
      "Filter for dates of leaving on or before the specified date. Format: YYYY-MM-DD.",
    example: "2024-11-30",
  },
];

export const statutorySideNavList = [
  {
    name: "EPF",
    link: "/payment-components/statutory-fields/employee-provident-fund",
    icon: "",
  },
  {
    name: "ESI",
    link: "/payment-components/statutory-fields/employee-state-insurance",
    icon: "",
  },
  {
    name: "Professional Tax",
    link: "/payment-components/statutory-fields/professional-tax",
    icon: "",
  },
  {
    name: "Labour welfare fund",
    link: "/payment-components/statutory-fields/labour-welfare-fund",
    icon: "",
  },
  {
    name: "Statutory Bonus",
    link: "/payment-components/statutory-fields/statutory-bonus",
    icon: "",
  },
  {
    name: "Gratuity",
    link: "/payment-components/statutory-fields/gratuity",
    icon: "",
  },
];

export const cacheKeyPrefix = {
  root: "root",
  index: "index",
  protected: "protected",
  dashboard: "dashboard",
  employees_main: "employees-main",
  employees: "employees",
}



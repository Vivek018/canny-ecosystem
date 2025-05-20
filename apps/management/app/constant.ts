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

export const CANNY_MANAGEMENT_SERVICES_NAME = "Canny Management Services";

export const CANNY_MANAGEMENT_SERVICES_ADDRESS =
  "502-503, Girivar Glean, Under Odhav Overbrigde, Sardar Patel Ring Rd, nr. Palm Hotel, Odhav, Ahmedabad, Gujarat 382415";

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
    example: ["John Doe", "Synthentica", "EMP123"],
  },
  {
    name: "dob_start",
    valueType: "date",
    example: "1990-01-01",
  },
  {
    name: "dob_end",
    valueType: "date",
    example: "2000-12-31",
  },
  {
    name: "gender",
    valueType: genderArray,
    example: "male",
  },
  {
    name: "education",
    valueType: educationArray,
    example: "Bachelor's",
  },
  {
    name: "status",
    valueType: statusArray,
    example: "active",
  },
  {
    name: "project",
    valueType: "string",
    example: "Project A",
  },
  {
    name: "project_site",
    valueType: "string",
    example: "Site B",
  },
  {
    name: "assignment_type",
    valueType: assignmentTypeArray,
    example: "full-time",
  },
  {
    name: "position",
    valueType: positionArray,
    example: "Software Engineer",
  },
  {
    name: "skill_level",
    valueType: skillLevelArray,
    example: "senior",
  },
  {
    name: "doj_start",
    valueType: "date",
    example: "2020-01-01",
  },
  {
    name: "doj_end",
    valueType: "date",
    example: "2023-12-31",
  },
  {
    name: "dol_start",
    valueType: "date",
    example: "2022-01-01",
  },
  {
    name: "dol_end",
    valueType: "date",
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
  {
    name: "Leave Encashment",
    link: "/payment-components/statutory-fields/leave-encashment",
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
  employee_overview: "employee-overview",
  employee_work_portfolio: "employee-work-portfolio",
  employee_reimbursements: "employee-reimbursements",
  employee_letters: "employee-letters",
  employee_payments: "employee_payments",
  payroll: "payroll",
  run_payroll: "run-payroll",
  run_payroll_id: "run-payroll-id",
  payroll_history: "payroll-history",
  payroll_history_id: "payroll-history-id",
  employee_documents: "employee_documents",
  reimbursements: "reimbursements",
  payroll_components: "payroll-components",
  payment_fields: "payment-fields",
  payment_field_report: "payment-field-report",
  statutory_field_epf: "statutory-field-epf",
  statutory_field_esi: "statutory-field-esi",
  professional_tax: "professional-tax",
  labour_welfare_fund: "labour-welfare-fund",
  statutory_bonus: "statutory-bonus",
  gratuity: "gratuity",
  leave_encashment: "leave-encashment",
  payment_templates: "payment-templates",
  projects_main: "projects_main",
  projects: "projects",
  project_overview: "project-overview",
  sites: "sites",
  site_overview: "site-overview",
  site_link_templates: "site-link-templates",
  general: "general",
  locations: "locations",
  relationships: "relationships",
  user: "user",
  users: "users",
  account: "account",
  feedback_list: "feedback-list",
  exits: "exits",
  incidents: "incidents",
  accident: "accident",
  approvals: "approvals",
  time_tracking: "time-tracking",
  settings: "settings",
  attendance: "attendance",
  case: "case",
  employee_leaves: "employee-leaves",
  leaves: "leaves",
  holidays: "holidays",
  pay_sequence: "pay-sequence",
  reports: "reports",
  company_document: "company-document",
  attendance_report: "attendance-report",
  payroll_invoice: "payroll-invoice",
};

export const SALARY_SLIP_TITLE = "Salary Slip Form IV B [Rule 26(2)(b)]";

export function numberToWordsIndian(num: number) {
  const belowTwenty = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const units = [
    "",
    "thousand",
    "lakh",
    "crore",
    "arab",
    "kharab",
    "neel",
    "padma",
  ];

  function convertBelowThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return belowTwenty[n];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 ? ` ${belowTwenty[n % 10]}` : "")
      );
    return `${belowTwenty[Math.floor(n / 100)]} hundred${
      n % 100 ? ` ${convertBelowThousand(n % 100)}` : ""
    }`;
  }

  function convertIntegerToWordsIndian(n: number) {
    if (n === 0) return "zero";

    const parts = [];
    let i = 0;

    while (n > 0) {
      const remainder = n % (i === 0 ? 1000 : 100); // First group is 3 digits, subsequent groups are 2 digits
      if (remainder > 0) {
        const groupName = i > 0 ? units[i] : ""; // Add lakh, crore, etc.
        parts.unshift(
          convertBelowThousand(remainder) + (groupName ? ` ${groupName}` : "")
        );
      }
      n = Math.floor(n / (i === 0 ? 1000 : 100)); // Reduce the number based on the group
      i++;
    }

    return parts.join(" ");
  }

  function convertDecimalPart(decimalStr: string) {
    return decimalStr
      .split("")
      .map((digit) => belowTwenty[Number.parseInt(digit, 10)])
      .join(" ");
  }

  // Split integer and decimal parts
  const [integerPart, decimalPart] = num.toString().split(".");
  const integerWords = convertIntegerToWordsIndian(
    Number.parseInt(integerPart, 10)
  );
  const decimalWords = decimalPart
    ? `point ${convertDecimalPart(decimalPart)}`
    : "";

  return `${integerWords}${decimalPart ? ` ${decimalWords}` : ""}`;
}

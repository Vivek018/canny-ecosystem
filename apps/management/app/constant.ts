import { filterComparison } from "@canny_ecosystem/supabase/constant";
import type { NavList } from "@canny_ecosystem/types";

export const DEFAULT_ROUTE = "/";

export const CANNY_MANAGEMENT_SERVICES_COMPANY_ID =
  "3f01b65d-ba67-4d57-9e79-c5ad9d8695a3";

export const CANNY_MANAGEMENT_SERVICES_NAME =
  "Canny Management Services Pvt. Ltd.";

export const CANNY_MANAGEMENT_SERVICES_ADDRESS =
  "502-503, Girivar Glean, Under Odhav Overbrigde, Sardar Patel Ring Rd, nr. Palm Hotel, Odhav, Ahmedabad, Gujarat 382415";

export const CANNY_MANAGEMENT_SERVICES_ACCOUNT_NUMBER = "093005001273";

export const CANNY_MANAGEMENT_SERVICES_IFSC_CODE = "ICIC0000930";

export const CANNY_MANAGEMENT_SERVICES_BRANCH_NAME = "Bapunagar Ahmedabad";

export const CANNY_MANAGEMENT_SERVICES_HSN_CODE_NUMBER = "9985";

export const CANNY_MANAGEMENT_SERVICES_PAN_NUMBER = "AADCC6596P";

export const CANNY_MANAGEMENT_SERVICES_GSTIN = "24AADCC6596P1ZZ";

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
  { name: "Vehicles", link: "/vehicles", icon: "rocket" },
  { name: "Group 2" },
  {
    name: "Payment",
    link: "/payroll",
    icon: "table",
  },
  { name: "Approvals", link: "/approvals", icon: "check-circle" },
  { name: "Group 3" },
  {
    name: "Time Tracking",
    link: "/time-tracking",
    icon: "lab-timer",
  },
  {
    name: "Components",
    link: "/payment-components",
    icon: "input",
  },
  { name: "Events", link: "/events", icon: "exclaimation-triangle" },
  // { name: "Reports", link: "/reports", icon: "report" },
  { name: "Group 5" },
  { name: "Modules", link: "/modules", icon: "project" },
  {
    name: "Settings",
    link: "/settings",
    icon: "setting",
  },
] as NavList[];

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

export const chatCategories = [
  {
    name: "Employee",
    link: "/chat/chatbox/employee",
    icon: "",
  },
  {
    name: "Payment",
    link: "/chat/chatbox/payment",
    icon: "",
  },
  {
    name: "Attendance",
    link: "/chat/chatbox/attendance",
    icon: "",
  },
  {
    name: "Reports",
    link: "/chat/chatbox/reports",
    icon: "",
  },
  {
    name: "Events",
    link: "/chat/chatbox/events",
    icon: "",
  },
];

export const cacheKeyPrefix = {
  root: "root",
  index: "index",
  protected: "protected",
  dashboard: "dashboard",
  chat: "chat",
  chatbox: "chatbox",
  chatbox_employee: "chatbox-employee",
  save_chat_id: "save-chat-id",
  employees_main: "employees-main",
  employees: "employees",
  employee_overview: "employee-overview",
  employee_work_portfolio: "employee-work-portfolio",
  employee_reimbursements: "employee-reimbursements",
  employee_letters: "employee-letters",
  employee_payments: "employee_payments",
  employee_salary: "employee_salary",
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
  modules: "modules",
  projects_main: "projects-main",
  projects: "projects",
  project_overview: "project-overview",
  sites_main: "sites-main",
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
  events: "events",
  incidents: "incidents",
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
  departments_main: "departments_main",
  departments: "departments",
  payee: "payee",
  vehicles_main: "vehicles_main",
  vehicles: "vehicles",
  vehicle_overview: "vehicle-overview",
  vehicle_usage: "vehicl-usage",
};

export const SALARY_SLIP_TITLE = "Form IV B [Rule 26(2)(b)]";

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
      const remainder = n % (i === 0 ? 1000 : 100);
      if (remainder > 0) {
        const groupName = i > 0 ? units[i] : "";
        parts.unshift(
          convertBelowThousand(remainder) + (groupName ? ` ${groupName}` : ""),
        );
      }
      n = Math.floor(n / (i === 0 ? 1000 : 100));
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
    Number.parseInt(integerPart, 10),
  );
  const decimalWords = decimalPart
    ? `point ${convertDecimalPart(decimalPart)}`
    : "";

  return `${integerWords}${decimalPart ? ` ${decimalWords}` : ""}`;
}

export const recentlyAddedFilter = Object.keys(filterComparison);

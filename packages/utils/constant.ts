export const SECONDS_IN_A_MONTH = 60 * 60 * 24 * 30;

export const DELETE_TEXT = "permanently delete";

export const modalSearchParamNames = {
  import_employee_details: "import-employee-details",
  import_employee_statutory: "import-employee-statutory",
  import_employee_bank_details: "import-employee-bank-details",
  import_employee_address: "import-employee-address",
  import_employee_guardians: "import-employee-guardians",
  import_employee_attendance: "import-employee-attendance",
  import_reimbursement: "import-reimbursement",
  view_template_components: "view-template-components",
  view_link_template: "view-link-template",
  create_link_template: "create-link-template",
  update_link_template: "update-link-template",
  view_relationship_terms: "view-relationship-terms",
  view_pay_sequence: "view-pay-sequence",
  edit_pay_sequence: "edit-pay-sequence",
};

export const statesAndUTs = [
  { value: "andhra_pradesh", label: "Andhra Pradesh" },
  { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
  { value: "assam", label: "Assam" },
  { value: "bihar", label: "Bihar" },
  { value: "chhattisgarh", label: "Chhattisgarh" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "himachal_pradesh", label: "Himachal Pradesh" },
  { value: "jharkhand", label: "Jharkhand" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "madhya_pradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "manipur", label: "Manipur" },
  { value: "meghalaya", label: "Meghalaya" },
  { value: "mizoram", label: "Mizoram" },
  { value: "nagaland", label: "Nagaland" },
  { value: "odisha", label: "Odisha" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "sikkim", label: "Sikkim" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "tripura", label: "Tripura" },
  { value: "uttar_pradesh", label: "Uttar Pradesh" },
  { value: "uttarakhand", label: "Uttarakhand" },
  { value: "west_bengal", label: "West Bengal" },
  {
    value: "andaman_and_nicobar_islands",
    label: "Andaman and Nicobar Islands",
  },
  { value: "chandigarh", label: "Chandigarh" },
  {
    value: "dadra_and_nagar_haveli_and_daman_and_diu",
    label: "Dadra and Nagar Haveli and Daman and Diu",
  },
  { value: "lakshadweep", label: "Lakshadweep" },
  { value: "delhi", label: "Delhi" },
  { value: "puducherry", label: "Puducherry" },
  { value: "ladakh", label: "Ladakh" },
  { value: "jammu_and_kashmir", label: "Jammu and Kashmir" },
];

export const employeeContributionRate = [
  { value: false, label: "20% of Actual PF Wage" },
  { value: true, label: "Restrict Contribution to ₹15,000 of PF Wage" },
];

export const employerContributionRate = [
  { value: false, label: "20% of Actual PF Wage" },
  { value: true, label: "Restrict Contribution to ₹15,000 of PF Wage" },
];
export const payoutMonths = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const EMPLOYEE_EPF_PERCENTAGE = 0.12;
export const EMPLOYER_EPF_PERCENTAGE = 0.12;
export const EMPLOYER_EDLI_PERCENTAGE = 0.005;
export const EMPLOYER_EPS_PERCENTAGE = 0.0833;
export const EMPLOYER_ADMIN_CHARGES_PERCENTAGE = 0.005;

export const exitPaymentFields = [
  "bonus",
  "diwali_bonus",
  "commission",
  "joining_bonus",
  "yearly_bonus",
  "leave_encashment",
  "gift_coupon",
  "gratuity",
  "computer_service_charges",
  "deduction",
];

export const attribute = {
  dashboard: "dashboard",
  company: "company",
  employees: "employees",
  employee: "employee",
  employeeDetails: "employee_details",
  employeeStatutory: "employee_statutory",
  employeeBankDetails: "employee_bank_details",
  employeeAddresses: "employee_addresses",
  employeeGuardians: "employee_guardians",
  employeeProjectAssignment: "employee_project_assignment",
  employeeWorkHistory: "employee_work_history",
  employeeSkills: "employee_skills",
  reimbursements: "reimbursements",
  exits: "exits",
  paymentFields: "payment_fields",
  statutoryFieldsEpf: "statutory_fields_epf",
  statutoryFieldsEsi: "statutory_fields_esi",
  statutoryFieldsPf: "statutory_fields_pf",
  statutoryFieldsLwf: "statutory_fields_lwf",
  statutoryFieldsStatutoryBonus: "statutory_fields_statutory_bonus",
  statutoryFieldsGraduity: "statutory_fields_graduity",
  paymentTemplates: "payment_templates",
  projects: "projects",
  project: "project",
  projectSites: "project_sites",
  projectSite: "project_site",
  settingGeneral: "setting_general",
  settingLocations: "setting_locations",
  settingRelationships: "setting_relationships",
  settingUsers: "setting_users",
  feedbackList: "feedback_list",
  reports: "reports",
  approvals: "approvals",
  paymentComponent: "payment_component",
  settings: "settings",
  users: "users",
  payroll: "payroll",
};

export const Months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const monthMap: { [key: string]: number } = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

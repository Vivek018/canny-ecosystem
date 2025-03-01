export const MILLISECONDS_IN_A_MIN = 60 * 1000;
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
  import_exits: "import-exits",
  view_template_components: "view-template-components",
  view_relationship_terms: "view-relationship-terms",
  import_leaves: "import-leaves",
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
  "leave_encashment",
  "gratuity",
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
  employeeLetters: "employee_letters",
  employeeReimbursements: "employee_reimbursements",
  employeeAttendance: "employee_attendance",
  employeeExits:  "employee_exits",
  employeePaymentTemplateLink:  "payment_template_link",
  employeeDocuments:"employee_documents",
  reimbursements: "reimbursements",
  exits: "exits",
  paymentFields: "payment_fields",
  statutoryFields: "statutory_fields",
  statutoryFieldsEpf: "statutory_fields_epf",
  statutoryFieldsEsi: "statutory_fields_esi",
  statutoryFieldsPf: "statutory_fields_pf",
  statutoryFieldsLwf: "statutory_fields_lwf",
  statutoryFieldsStatutoryBonus: "statutory_fields_statutory_bonus",
  statutoryFieldsGraduity: "statutory_fields_graduity",
  statutoryFieldsLeaveEncashment: "statutory_fields_leave_encashment",
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
  incidents: "incidents",
  paymentComponent: "payment_component",
  settings: "settings",
  users: "users",
  payroll: "payroll",
  attendance: "attendance",
  accidents: "accidents",
  cases: "cases",
  employeeLeaves: "employee_leaves",
  leaves: "leaves",
  timeTracking: "time_tracking",
  holidays: "holidays",
  paySequence: "pay_sequence",
};

export const months: { [key: string]: number } = {
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

export const DEFAULT_APPOINTMENT_LETTER = `Dear **Mr. Ayden Kai Marks**,

With reference to your application and subsequent interview and discussion that you had with us, we are pleased to offer you the position of "**\${employeePosition}**" in our organization Contract at \${companyName} w.e.f. **\${employeeJoiningDate}**.&#x20;

**With the following terms and conditions:**&#x20;

With reference to your application and subsequent interview and discussion that you had with us, we are pleased to offer you the position of “**\${employeePosition}**” in our organization Contract \${companyName} w.e.f. **\${employeeJoiningDate}**&#x20;

1\. **POSTING AND REPORTING STRUCTURE**: You will be posted at our Contract in Koss Johnson and Johnson and you would report to Site in Charge for smooth functioning. You will interact directly with other seniors/supervisors as well.&#x20;

2\. **PROBATION**: You will be on probation for a period of three months from the date of appointment. The probation period will be extendable at the discretion of management until it is satisfied with your work and conduct during the probationary period. You shall be deemed to be on probation until a letter of confirmation is issued to you in writing.&#x20;

3\. **RESIGNATION / TERMINATION**: During the period of probation, the company may terminate your service on 24 hours' notice. Should you choose to resign during the period of probation, you must provide 24 hours' notice. After being confirmed, the company can terminate your service without assigning any reason by giving one month's notice or salary in lieu, and vice versa.&#x20;

4\. **PERFORMANCE EVALUATION - INCREMENT**: Annual increment will depend upon your consistent performance and will not be a matter of right. The company reserves the right to grant or withhold annual increment as it may deem fit.&#x20;

5\. **TRANSFER**: Your services are transferable to any other site/department/branch/office, etc., as existing with us at the time of transfer.&#x20;

6\. **CONFIDENTIAL AGREEMENT**: Any employee should not disclose the confidential information of the organization and clients with anybody outside the organization during and after the service tenure. Any deed done by the employee using his/her or somebody else's system/workplace which may lead to damages/legal implications, any liability arising out of such deeds will be borne by the employee himself/herself.&#x20;

7\. **JURISDICTION**: In case of any dispute, the courts in the city of Ahmedabad will have jurisdiction.&#x20;

8\. **ABSENCE OR UNAUTHORIZED LEAVE**: Unauthorized leave or absence for a continuous period of 8 days would make you lose your lien in the service, and you will be considered to have abandoned your service of your own accord, and the same shall automatically come to an end without any notice or intimation to you.&#x20;

If the above terms and conditions are acceptable to you, please sign the duplicate copy of the appointment letter as an acknowledgment and submit the same along with the recruitment papers. With the best wishes for a happy and long association with Canny Management Services Pvt. Ltd.`;

export const DEFAULT_OFFER_LETTER = `
Dear \${employeeName},
Congratulations! Canny Management Services Pvt Ltd is pleased to offer you the position of "\${employeePosition}" in our contract
in \${companyName} \${companyCity}. We trust that this offer will meet with your approval.
Reporting to your Manager/Supervisor, your starting salary will be 22,000=00/- in hand monthly including Bonus. Your
first day of work will be \${employeeJoiningDate}. You are eligible for the employee benefit program as outlined in the attachment to
this job offer.
This offer is conditional upon our satisfactory completion of your reference checks.
Please sign the enclosed copy of this letter and return it to us before your joining to indicate your acceptance of this
offer.
The entire team at Canny Management Services Pvt Ltd is looking forward to working with you, and we are confident
you will be able to make a significant contribution to the success of our organization.
`;

export const DEFAULT_TERMINATION_LETTER = `
Dear \${employeeName},
You are working with us as "\${employeePosition}" in our contract with \${companyName}, \${companyCity} (Industries &
Environment).
Since your services are no longer required, your employment stands terminated with immediate effect i.e. from
\${employeeLeavingDate} with the close of working hours in accordance with the terms of your employment contract.
All your legal dues, including notice pay, will be settled as per the terms of your employment contract.
You are advised to hand over the \${companyName}'s property, if any, to the authorized person and obtain a
clearance certificate to enable us to process your dues settlement.
We thank you for your services and wish you all the best in the future.
`;

export const DEFAULT_EXPERIENCE_LETTER = `Dear \${employeeName},
Congratulations! Canny Management Services Pvt Ltd is pleased to offer you the position of "\${employeePosition}" in our contract
in \${companyName} \${companyCity}. We trust that this offer will meet with your approval.
Reporting to your Manager/Supervisor, your starting salary will be 22,000=00/- in hand monthly including Bonus. Your
first day of work will be \${employeeJoiningDate}. You are eligible for the employee benefit program as outlined in the attachment to
this job offer.
This offer is conditional upon our satisfactory completion of your reference checks.
Please sign the enclosed copy of this letter and return it to us before your joining to indicate your acceptance of this
offer.
The entire team at Canny Management Services Pvt Ltd is looking forward to working with you, and we are confident
you will be able to make a significant contribution to the success of our organization.`;

export const DEFAULT_NOC_LETTER = `Dear Sir/Madam,
This is in regard to the above-mentioned subject; we have no objection in recruiting \${employeeName} into your
company.
\${employeeName} has been working in our company since \${employeeJoiningDate}.
She is sincere and honest in her work. We wish her all the best in her future career.
Her gross salary is Rs. 25,802/- per month as of July 2024. She is receiving benefits of PF, ESIC, and Statutory Bonus
from our company.
Thanking you,
`;

export const DEFAULT_RELIEVING_LETTER = `
Dear \${employeeName},
With reference to your resignation letter dated \${employeeLeavingDate}, we hereby accept your resignation and agree to relieve you
from your duties on \${employeeLeavingDate}.
We confirm that you have been working with our company from \${employeeJoiningDate} to \${employeeLeavingDate}.
During your employment with us, we found you to be hardworking and honest.
We wish you all the best in your future endeavors.
Thanking you,
`;

export const DEFAULT_LETTER_CONTENT = {
  appointment_letter: DEFAULT_APPOINTMENT_LETTER,
  experience_letter: DEFAULT_EXPERIENCE_LETTER,
  offer_letter: DEFAULT_OFFER_LETTER,
  noc_letter: DEFAULT_NOC_LETTER,
  relieving_letter: DEFAULT_RELIEVING_LETTER,
  termination_letter: DEFAULT_TERMINATION_LETTER,
};

export const SUPABASE_STORAGE = {
  LOGOS: "logos",
  EMPLOYEE_PROFILE_PHOTO: "employees/profile-photo",
};

export const SUPABASE_BUCKET = {
  CANNY_ECOSYSTEM: "canny-ecosystem",
};
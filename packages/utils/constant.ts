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
  import_employee_attendance_by_present_days:
    "import-employee-attendance-by-present-days",
  import_reimbursement: "import-reimbursement",
  import_exits: "import-exits",
  view_template_components: "view-template-components",
  view_relationship_terms: "view-relationship-terms",
  import_leaves: "import-leaves",
  import_payroll: "import-payroll",
  import_salary_payroll: "import-salary-payroll",
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
  employeeWorkPortfolio: "employee_work_portfolio",
  employeePayments: "employee_payments",
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
  employeeExits: "employee_exits",
  employeePaymentTemplateLink: "payment_template_link",
  employeeDocuments: "employee_documents",
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
  settingDocuments: "setting_documents",
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
  companyDocuments: "company_documents",
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

export const DEFAULT_APPOINTMENT_LETTER = `Dear **Mr. \${employeeName}**,

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

If the above terms and conditions are acceptable to you, please sign the duplicate copy of the appointment letter as an acknowledgment and submit the same along with the recruitment papers. With the best wishes for a happy and long association with Canny Management Services Pvt. Ltd.
`;

export const DEFAULT_OFFER_LETTER = `Dear **$\{employeeName}**,

We are pleased to extend an offer of employment to you for the position of $\{employeePosition} with $\{companyName}. This role will be based at $\{companyLocation} , and we are confident that your skills and experience will contribute significantly to the success of the project and our organization.

Below are the details of your employment offer:

1. Position: $\{employeePosition}
2. Reporting To: Your Manager/Supervisor
3. Starting Salary: ₹$\{startingSalary}/- per month (in hand, including bonus)
4. Joining Date: $\{employeeJoiningDate}
5. Work Location: $\{companyLocation}
6. Nature of Employment: \[Full-Time/Part-Time/Contractual]

###### **Employee Benefits**

You will be eligible for the following benefits as per the policies outlined in the attached document:

* Health Insurance
* Provident Fund (PF) Contributions
* Gratuity (if applicable)
* Leave Policy (Earned Leaves, Sick Leaves, etc.)
* Other Perks (e.g., Meal Vouchers, Transportation Allowance, etc.)

Please review the attached Employee Handbook or Benefits Summary for further details.

###### **Conditions of Employment**

This offer is contingent upon the following:

1. Successful completion of reference checks and background verification.
2. Submission of all required documents, including proof of identity, address, educational qualifications, and previous employment records.
3. Signing and returning this offer letter by **\[Acceptance Deadline Date]** .

Failure to meet any of the above conditions may result in the withdrawal of this offer.

Sincerely,`;

export const DEFAULT_TERMINATION_LETTER = `Dear **\${employeeName}**,

We regret to inform you that your services as "**\${employeePosition}**" under our contract with \${companyName} , \${companyLocation} (\${siteName}), are no longer required. In accordance with the terms of your employment contract, your employment stands terminated with immediate effect from October 10, 2023 , at the close of working hours.

**As per the terms of your employment contract:**

All your legal dues, including notice pay (if applicable), will be settled in due course.
You are required to return any property belonging to ABC Corporation (e.g., ID cards, laptops, access badges, etc.) to the authorized person by October 12, 2023 .
Upon returning the company property, you will receive a clearance certificate, which will enable us to process your final dues settlement without delay.
We appreciate your contributions during your tenure with us and thank you for your services. We wish you all the best in your future endeavors.

If you have any questions or need clarification regarding this communication, please feel free to contact us at [hr@cannymgmt.com](mailto:hr@cannymgmt.com) or +91 1234567890 .

Yours sincerely,`;

export const DEFAULT_EXPERIENCE_LETTER = `Dear **$\{employeeName}**,

This is to certify that **$\{employeeName}** has been employed with **Canny Management Services Pvt Ltd** as a **$\{employeePosition}** from **$\{employeeJoiningDate}** to **$\{employeeLeavingDate}** . During this period, \[he/she/they] have worked under our contract with **$\{companyName}** located in **$\{companyLocation}**.

**Key Responsibilities and Contributions:**
During his tenure, John reported directly to the Team Lead and was responsible for:

* Managing customer queries and ensuring timely resolution of issues.
* Collaborating with internal teams to improve service quality and client satisfaction.
* Maintaining accurate records of customer interactions and feedback.

John demonstrated professionalism, dedication, and a strong work ethic throughout his employment. His contributions were instrumental in enhancing customer satisfaction and achieving team objectives.

**Employment Details:**

* **Position Held:** $\{employeePosition}
* **Duration of Employment:** $\{employeeJoiningDate}, to $\{employeeLeavingDate}
* **Location:** $\{companyLocation}
* **Salary:** ₹22,000/- per month (in hand, including all applicable allowances and bonuses)

We wish John all the best in his future endeavors and are confident that he will continue to excel in his professional journey.

For any further clarification or verification, please feel free to contact us at [**hr@cannymgmt.com** ](mailto:hr@cannymgmt.com)or **+91 1234567890** .`;

export const DEFAULT_NOC_LETTER = `Dear **Sir/Madam**,

This is with reference to the above-mentioned subject. We hereby confirm that we have no objection to the recruitment of **$\{employeeName}** into your esteemed organization.

$\{employeeName} has been associated with $\{companyName} since $\{companyJoiningDate} . During her tenure with us, she has consistently demonstrated sincerity, dedication, and honesty in her work ethic. Her contributions have been highly valued, and we appreciate her commitment to excellence. We wish her all the best in her future endeavors.

**For your reference, below are her employment details:**

* Position Held: Customer Support Executive
*  Gross Salary (as of July 2024): ₹30,000/- per month
*  Benefits Provided: Provident Fund (PF), Employee State Insurance Corporation (ESIC), and Statutory Bonus
* Should you require any further information or clarification regarding her employment, please feel free to contact us at [hr@cannymgmt.com](mailto:hr@cannymgmt.com) or +91 1234567890 .

Thank you for considering this communication.

Yours sincerely,`;

export const DEFAULT_RELIEVING_LETTER = `Dear **$\{employeeName}**,

With reference to your resignation letter dated $\{employeeLeavingDate} , we hereby accept your resignation and confirm that you will be relieved from your duties on $\{employeeLeavingDate}.

We would like to confirm that you have been associated with $\{companyName} from **$\{employeeJoiningDate}** to **$\{employeeLeavingDate}**. During your tenure with us, you have demonstrated dedication, hard work, and integrity in all your responsibilities. Your contributions have been valuable, and we sincerely appreciate your efforts during your time with the company.

We wish you all the best in your future endeavors and are confident that you will continue to achieve great success in your professional journey.

Thank you for your service and commitment to $\{companyName} . Should you require any assistance or documentation in the future, please do not hesitate to reach out to us at \[Contact Information] .

Yours sincerely,`;
export const SUPABASE_STORAGE = {
  LOGOS: "logos",
  EMPLOYEE_PROFILE_PHOTO: "employees/profile_photo",
  AVATAR: "avatar",
};

export const SUPABASE_BUCKET = {
  CANNY_ECOSYSTEM: "canny-ecosystem",
};

export const SUPABASE_MEDIA_URL_PREFIX =
  "https://oghojvhpbxanipiuxwbu.supabase.co/storage/v1/object/public/";

export function getFilePathFromUrl(url: string) {
  return url.startsWith(
    `${SUPABASE_MEDIA_URL_PREFIX}${SUPABASE_BUCKET.CANNY_ECOSYSTEM}/`
  )
    ? url.slice(
        `${SUPABASE_MEDIA_URL_PREFIX}${SUPABASE_BUCKET.CANNY_ECOSYSTEM}/`.length
      )
    : url;
}

export const stateLWFContributions = [
  {
    state: "Andhra Pradesh",
    label: "AP",
    employee_contribution: 30,
    employer_contribution: 70,
    deduction_cycle: "yearly",
  },
  {
    state: "Chandigarh",
    label: "CH",
    employee_contribution: 5,
    employer_contribution: 20,
    deduction_cycle: "half_yearly",
  },
  {
    state: "Chhattisgarh",
    label: "CG",
    employee_contribution: 15,
    employer_contribution: 45,
    deduction_cycle: "half_yearly",
  },
  {
    state: "Delhi",
    label: "DL",
    employee_contribution: 0.75,
    employer_contribution: 2.25,
    deduction_cycle: "half_yearly",
  },
  {
    state: "Goa",
    label: "GA",
    employee_contribution: 60,
    employer_contribution: 180,
    deduction_cycle: "half_yearly",
  },
  {
    state: "Gujarat",
    label: "GJ",
    employee_contribution: 6,
    employer_contribution: 12,
    deduction_cycle: "half_yearly",
  },
  {
    state: "Haryana",
    label: "HR",
    employee_contribution: 34, // 0.2% of salary, max Rs. 34
    employer_contribution: 68, // Twice the employee contribution
    deduction_cycle: "monthly",
  },
  {
    state: "Karnataka",
    label: "KA",
    employee_contribution: 50,
    employer_contribution: 100,
    deduction_cycle: "yearly",
  },
  {
    state: "Kerala",
    label: "KL",
    employee_contribution: 20,
    employer_contribution: 20,
    deduction_cycle: "monthly",
  },
  {
    state: "Madhya Pradesh",
    label: "MP",
    employee_contribution: 10,
    employer_contribution: 30,
    deduction_cycle: "half_yearly",
  },
  {
    state: "Maharashtra",
    label: "MH",
    employee_contribution: 25,
    employer_contribution: 75,
    deduction_cycle: "half_yearly",
  },
  {
    state: "Odisha",
    label: "OR",
    employee_contribution: 10,
    employer_contribution: 20,
    deduction_cycle: "half_yearly",
  },
  {
    state: "Punjab",
    label: "PB",
    employee_contribution: 5,
    employer_contribution: 20,
    deduction_cycle: "monthly",
  },
  {
    state: "Tamil Nadu",
    label: "TN",
    employee_contribution: 20,
    employer_contribution: 40,
    deduction_cycle: "yearly",
  },
  {
    state: "Telangana",
    label: "TG",
    employee_contribution: 2,
    employer_contribution: 5,
    deduction_cycle: "yearly",
  },
  {
    state: "West Bengal",
    label: "WB",
    employee_contribution: 3,
    employer_contribution: 15,
    deduction_cycle: "half_yearly",
  },
];

const pfMultiplier = 10000;
const maxNumber = 999999999;

export const stateProfessionalTax = [
  {
    state: "Andhra Pradesh",
    label: "AP",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 15000, value: 0 },
      { start: 15001, end: 20000, value: 150 },
      { start: 20001, end: maxNumber, value: 200 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Assam",
    label: "AS",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 10000, value: 0 },
      { start: 10001, end: 15000, value: 150 },
      { start: 15001, end: 25000, value: 180 },
      { start: 25001, end: maxNumber, value: 208 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Bihar",
    label: "BR",
    deduction_cycle: "yearly",
    gross_salary_range: [
      { start: 0, end: 300000, value: 0 },
      { start: 300001, end: 500000, value: 1000 },
      { start: 500001, end: pfMultiplier, value: 2000 },
      { start: 1000001, end: maxNumber, value: 2500 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Chhattisgarh",
    label: "CG",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 5000, value: 0 },
      { start: 5001, end: 10000, value: 60 },
      { start: 10001, end: maxNumber, value: 80 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Gujarat",
    label: "GJ",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 6000, value: 0 },
      { start: 6001, end: 9000, value: 80 },
      { start: 9001, end: 12000, value: 150 },
      { start: 12001, end: maxNumber, value: 200 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Jharkhand",
    label: "JH",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 25000, value: 0 },
      { start: 25001, end: 30000, value: 125 },
      { start: 30001, end: 40000, value: 167 },
      { start: 40001, end: 50000, value: 200 },
      { start: 50001, end: maxNumber, value: 208 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Karnataka",
    label: "KA",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 15000, value: 0 },
      { start: 15001, end: maxNumber, value: 200 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Kerala",
    label: "KL",
    deduction_cycle: "half_yearly",
    gross_salary_range: [
      { start: 0, end: 12000, value: 0 },
      { start: 12001, end: 18000, value: 120 },
      { start: 18001, end: 30000, value: 180 },
      { start: 30001, end: 45000, value: 300 },
      { start: 12500, end: maxNumber, value: 1250 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Madhya Pradesh",
    label: "MP",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 18750, value: 0 },
      { start: 18751, end: 25000, value: 125 },
      { start: 25001, end: 33333, value: 167 },
      { start: 33334, end: maxNumber, value: 208 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Maharashtra",
    label: "MH",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 7500, value: 0 },
      { start: 7501, end: 10000, value: 175 },
      { start: 10001, end: maxNumber, value: 200 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Odisha",
    label: "OD",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 15000, value: 0 },
      { start: 15001, end: 25000, value: 200 },
      { start: 25001, end: 35000, value: 250 },
      { start: 35001, end: 45000, value: 300 },
      { start: 45001, end: 100000, value: 350 },
      { start: 100001, end: maxNumber, value: 500 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Puducherry",
    label: "PY",
    deduction_cycle: "half_yearly",
    gross_salary_range: [
      { start: 0, end: 3000, value: 0 },
      { start: 3001, end: 6000, value: 60 },
      { start: 15001, end: maxNumber, value: 180 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Sikkim",
    label: "SK",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 15000, value: 0 },
      { start: 15001, end: 30000, value: 125 },
      { start: 30001, end: 50000, value: 200 },
      { start: 50001, end: 75000, value: 300 },
      { start: 75001, end: maxNumber, value: 400 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Tamil Nadu",
    label: "TN",
    deduction_cycle: "half_yearly",
    gross_salary_range: [
      { start: 0, end: 21000, value: 0 },
      { start: 21001, end: 30000, value: 150 },
      { start: 30001, end: 45000, value: 350 },
      { start: 45001, end: 60000, value: 700 },
      { start: 60001, end: 75000, value: 1050 },
      { start: 75001, end: maxNumber, value: 1250 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Telangana",
    label: "TG",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 15000, value: 0 },
      { start: 15001, end: 20000, value: 150 },
      { start: 20001, end: maxNumber, value: 200 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Tripura",
    label: "TR",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 5000, value: 0 },
      { start: 5001, end: 10000, value: 130 },
      { start: 10001, end: 15000, value: 165 },
      { start: 15001, end: 20000, value: 200 },
      { start: 20001, end: maxNumber, value: 208 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "West Bengal",
    label: "WB",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 10000, value: 0 },
      { start: 10001, end: 15000, value: 110 },
      { start: 15001, end: 25000, value: 130 },
      { start: 25001, end: 40000, value: 150 },
      { start: 40001, end: maxNumber, value: 200 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
  {
    state: "Meghalaya",
    label: "ML",
    deduction_cycle: "monthly",
    gross_salary_range: [
      { start: 0, end: 12000, value: 0 },
      { start: 12001, end: 18000, value: 150 },
      { start: 18001, end: 30000, value: 175 },
      { start: 30001, end: 50000, value: 200 },
      { start: 50001, end: maxNumber, value: 250 },
    ],
    pt_number: String(Math.floor(Math.random() * pfMultiplier)),
  },
];

export const publicHolidays = [
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Makar Sankranti",
    start_date: "2024-01-14",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Republic Day",
    start_date: "2024-01-26",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Guru Gobind Singh Jayanti",
    start_date: "2024-01-17",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Shivaji Jayanti",
    start_date: "2024-02-19",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Maha Shivratri",
    start_date: "2024-03-08",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Swami Dayanand Saraswati Jayanti",
    start_date: "2024-03-10",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Holi 2nd Day (Dhuleti)",
    start_date: "2024-03-25",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Good Friday",
    start_date: "2024-03-29",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Chetichand",
    start_date: "2024-03-30",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Ramzan-Eid (Eid-Ul-Fitra) (1st Shawaal)",
    start_date: "2024-03-31",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Easter Sunday",
    start_date: "2024-03-31",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Dr. Babasaheb Ambedkar Jayanti",
    start_date: "2024-04-14",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Ram Navami",
    start_date: "2024-04-17",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Mahavir Janma Kalyanak",
    start_date: "2024-04-21",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Hanuman Jayanti",
    start_date: "2024-04-23",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "May Day",
    start_date: "2024-05-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Buddha Purnima",
    start_date: "2024-05-23",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Jamat Ul-Vida",
    start_date: "2024-06-14",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Bakri Eid (Eid al-Adha)",
    start_date: "2024-06-17",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Guru Purnima",
    start_date: "2024-07-21",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Muharram",
    start_date: "2024-07-17",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Independence Day",
    start_date: "2024-08-15",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Parsi New Year (Navroz)",
    start_date: "2024-08-16",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Raksha Bandhan",
    start_date: "2024-08-19",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Onam",
    start_date: "2024-09-15",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Janmashtami",
    start_date: "2024-08-26",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Ganesh Chaturthi",
    start_date: "2024-09-07",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Samvatsari (Chaturthi Paksha)",
    start_date: "2024-09-11",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Gandhi Jayanti",
    start_date: "2024-10-02",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Vijaya Dashami (Dussehra)",
    start_date: "2024-10-12",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Eid-e-Milad",
    start_date: "2024-10-16",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Diwali",
    start_date: "2024-10-31",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Vikram Samvat New Year",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Bhai Bij",
    start_date: "2024-11-02",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Chhath Puja",
    start_date: "2024-11-07",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Guru Nanak Jayanti",
    start_date: "2024-11-15",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Christmas",
    start_date: "2024-12-25",
  },
  // Additional state-specific holidays
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Pongal",
    start_date: "2024-01-15",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Thiruvalluvar Day",
    start_date: "2024-01-16",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Uzhavar Thirunal",
    start_date: "2024-01-17",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Bihu (Bohag Bihu)",
    start_date: "2024-04-14",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Magh Bihu",
    start_date: "2024-01-15",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Kati Bihu",
    start_date: "2024-10-18",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Gudi Padwa",
    start_date: "2024-04-09",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Ugadi",
    start_date: "2024-04-09",
  },
  {
    is_mandatory: true,
    no_of_days: 1,
    name: "Baisakhi",
    start_date: "2024-04-14",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Vishu",
    start_date: "2024-04-14",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Bengali New Year (Poila Boishakh)",
    start_date: "2024-04-15",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Rath Yatra",
    start_date: "2024-07-07",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Teej",
    start_date: "2024-08-07",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Paryushana Parva",
    start_date: "2024-09-04",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Karnataka Rajyotsava",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Kerala Piravi",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Andhra Pradesh Formation Day",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Chhattisgarh Foundation Day",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Haryana Day",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Madhya Pradesh Foundation Day",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Punjab Formation Day",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Tamil Nadu Day",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Maharshi Valmiki Jayanti",
    start_date: "2024-10-17",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Kali Puja",
    start_date: "2024-10-31",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Kannada Rajyotsava",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Guru Tegh Bahadur's Martyrdom Day",
    start_date: "2024-11-24",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Arunachal Pradesh Foundation Day",
    start_date: "2024-02-20",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Mizoram State Day",
    start_date: "2024-02-20",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Bihar Day",
    start_date: "2024-03-22",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Telangana Formation Day",
    start_date: "2024-06-02",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Jharkhand Foundation Day",
    start_date: "2024-11-15",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Pondicherry Liberation Day",
    start_date: "2024-11-01",
  },
  {
    is_mandatory: false,
    no_of_days: 1,
    name: "Uttarakhand Formation Day",
    start_date: "2024-11-09",
  },
];

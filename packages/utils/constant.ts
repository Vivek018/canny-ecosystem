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

Sincerely,`

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

For any further clarification or verification, please feel free to contact us at [**hr@cannymgmt.com** ](mailto:hr@cannymgmt.com)or **+91 1234567890** .`

export const DEFAULT_NOC_LETTER = `Dear **Sir/Madam**,

This is with reference to the above-mentioned subject. We hereby confirm that we have no objection to the recruitment of **$\{employeeName}** into your esteemed organization.

$\{employeeName} has been associated with $\{companyName} since $\{companyJoiningDate} . During her tenure with us, she has consistently demonstrated sincerity, dedication, and honesty in her work ethic. Her contributions have been highly valued, and we appreciate her commitment to excellence. We wish her all the best in her future endeavors.

**For your reference, below are her employment details:**

* Position Held: Customer Support Executive
*  Gross Salary (as of July 2024): ₹30,000/- per month
*  Benefits Provided: Provident Fund (PF), Employee State Insurance Corporation (ESIC), and Statutory Bonus
* Should you require any further information or clarification regarding her employment, please feel free to contact us at [hr@cannymgmt.com](mailto:hr@cannymgmt.com) or +91 1234567890 .

Thank you for considering this communication.

Yours sincerely,`

export const DEFAULT_RELIEVING_LETTER = `Dear **$\{employeeName}**,

With reference to your resignation letter dated $\{employeeLeavingDate} , we hereby accept your resignation and confirm that you will be relieved from your duties on $\{employeeLeavingDate}.

We would like to confirm that you have been associated with $\{companyName} from **$\{employeeJoiningDate}** to **$\{employeeLeavingDate}**. During your tenure with us, you have demonstrated dedication, hard work, and integrity in all your responsibilities. Your contributions have been valuable, and we sincerely appreciate your efforts during your time with the company.

We wish you all the best in your future endeavors and are confident that you will continue to achieve great success in your professional journey.

Thank you for your service and commitment to $\{companyName} . Should you require any assistance or documentation in the future, please do not hesitate to reach out to us at \[Contact Information] .

Yours sincerely,`
export const MILLISECONDS_IN_A_MIN = 60 * 1000;
export const SECONDS_IN_A_MONTH = 60 * 60 * 24 * 30;

export const DELETE_TEXT = "permanently delete";

export const modalSearchParamNames = {
  import_employee_details: "import-employee-details",
  import_employee_statutory: "import-employee-statutory",
  import_employee_bank_details: "import-employee-bank-details",
  import_employee_address: "import-employee-address",
  import_employee_guardians: "import-employee-guardians",
  import_attendance: "import-attendance",
  import_reimbursement: "import-reimbursement",
  import_exits: "import-exits",
  view_template_components: "view-template-components",
  view_relationship_terms: "view-relationship-terms",
  import_leaves: "import-leaves",
  import_reimbursement_payroll: "import-reimbursement-payroll",
  import_exit_payroll: "import-exit-payroll",
  import_department_salary_payroll: "import-department-salary-payroll",
  import_salary_payroll: "import-salary-payroll",
  import_vehicle_usage: "import-vehicle-usage",
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

export const BONUS_PERCENTAGE = 0.0833;
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
  chat: "chat",
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
  employeeWorkDetails: " employee_work_details",
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
  modules: "modules",
  projects: "projects",
  project: "project",
  sites: "sites",
  site: "site",
  settingGeneral: "setting_general",
  settingLocations: "setting_locations",
  settingRelationships: "setting_relationships",
  settingPayee: "setting_payee",
  settingUsers: "setting_users",
  settingDocuments: "setting_documents",
  feedbackList: "feedback_list",
  reports: "reports",
  approvals: "approvals",
  events: "events",
  paymentComponent: "payment_component",
  settings: "settings",
  users: "users",
  payroll: "payroll",
  attendance: "attendance",
  incidents: "incidents",
  cases: "cases",
  employeeLeaves: "employee_leaves",
  leaves: "leaves",
  timeTracking: "time_tracking",
  holidays: "holidays",
  paySequence: "pay_sequence",
  companyDocuments: "company_documents",
  invoice: "invoice",
  departments: "departments",
  vehicles: "vehicles",
  vehicle_insurance: "vehicle_insurance",
  vehicle_loan: "vehicle_loan",
  vehicle_usage: "vehicle_usage",
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

export const DEFAULT_CONTRACTUAL_APPOINTMENT_LETTER = `
Dear $\{employeeName},

With reference to your application and subsequent interview, you are appointed as **$\{employeePosition}** in Canny under the contract of **$\{companyName}** on fixed term assignment basis specifically for **$\{projectName}** to be carried out at **$\{siteName}** for the specific period from **$\{employeeJoiningDate}** to **$\{employeeLeavingDate}** on the following terms and conditions:

1. Your immediate posting will be at **$\{siteName}**.
2. This Fixed Term Employment Contract shall automatically come to an end on **$\{employeeLeavingDate}** OR the date on which the OMC Project at **$\{siteName}** is terminated (whichever is earlier), unless extended by the Company in order to enable you to complete the assignment herein without the need for any further act or writing by either parties hereto. Prior thereto, this employment contract can be terminated by either party giving to the other, at any time, notice of 15 days in writing or by paying 15 day's gross salary in lieu of notice.

3. The Company shall for the performance of your services under this contract and the due performance of thereof, pay the following remuneration to you

**PART I:**

Basic Salary (including VDA) : INR **$\{basicSalary}**/- per month.
Bonus will be pay as government norm (8.33% on Basic + DA) per annum paid on pro rata basis
No work no pay - Salary will not be paid if there will be no work at the site on which you have been deployed.

If you are on leave frequently without any prior intimation/approval, Canny has rights to take necessary disciplinary action including termination of your Fixed Term Contract.

During the contractual tenure, your service is transferable to any location within India as per the operational needs of the company.

Consumption of alcohol at workplace or if found in intoxicated state at the workplace then, company has rights to take necessary disciplinary action including termination of your Fixed Term Contract.

You shall be duty bound to inform the Company in writing about your affiliation, association, and membership to any Labour-Unions in India prior to the signing of this Contract. Non-disclosure of your membership to a Labour Union to the Company shall be considered as a material breach of this Contract. You shall not join any Labour-Union during the continuation of this Fixed Term Contract without informing the Company in advance. You shall not provoke any other indulgence in any anti-Company activities in unison with any Labour Unions affiliated to any breach of this Fixed Term Contract.

**PART II:**

Provident Fund, Gratuity, ESIC and Profession Tax: As per Government of India norms.


4. You shall during the continuance of this contract honestly, faithfully, diligently and efficiently serve the Company and shall perform the duties assigned herein. You shall:

a. You will be responsible for collecting samples as advised.
b. You will also be responsible for preparing samples as per the requirements, if necessary.
c. Carry out all the duties/assignments and functions entrusted to you from time to time.
d. Devote the whole of your time and energy exclusively to assignment entrusted to you.
e. Serve the Company, obey all the lawful directions and orders of the Company, the management and of any officer placed in authority over you.
f. Shall responsible to dispose raw samples as per requirement.

5. Al communications, reports, data, etc. that may have been prepared by you in the carrying out of the assignment hereunder shall be between you and the Company. You shall not divulge, discuss or provide any work hereunder to anyone else except the Company without the prior written consent of the Company.

6. You shall at once inform the Company of any act of dishonesty and or any action prejudicial to the interests of the Company on the part of any person, which may come to your knowledge.

7. You shall not at any time absent yourself without any prior intimation / permission of your superior. In case of illness or accidents you shall forthwith notify the Company or the management of such illness or accident and shall furnish such evidence thereof as may be required. However, the Leave shall be provided as per the Company Policy.

8. You shall be bound by Canny's Business Ethics & Compliance Code during the continuance of this contract. Non-adherence to the same may cause termination of contract forthwith without any compensation.

9. You acknowledge that you shall receive and/or have access to Confidential Information during the Term of this Contract. For the purposes of this Contract, term "Confidential Information" shall have the same meaning as assigned to in the "Non-disclosure Agreement" attached as Appendix 2 to this Contract. You shall, during and after the termination of employment under this Contract, observe strict secrecy regarding any Confidential Information of Canny and any company that is the parent or subsidiary of Canny parent company (collectively referred to as "an Associated Company of Canny"). You shall not at any time during or after the term of this contract disclose directly or indirectly to any Third Person or apply or use the benefit of the employee or of any Third Party except any Associated Company of Canny, any Confidential information of Canny or any Associated Company of Canny which may come to your knowledge during the term of this Contract, nor shall you use, attempt to use any such Confidential Information in any manner which may injure or cause loss, directly or indirectly, to Canny or to an Associated Company of Canny, nor use your personal knowledge of or influence over customers. Clients or contractors of Canny so as to take advantage of trade or business connections or utilise the Confidential Information obtained by you in connection with this appointment according to the "Non-disclosure Agreement".


10. At all times throughout the Term of this Contract, you shall fully comply with all Indian Laws which apply to the business of Canny, including but not limited to labour, equal opportunity, privacy and sexual harassment laws. You shall promptly report to Canny of any violations of Indian Law encountered in the business. You shall also fully observe the Corporate Policies issued from time to time for the guidance of its employees. Canny shall have the right to terminate this contract with immediate effect for the violation of any applicable Indian Laws or Corporate Policies.

11. You shall not during the continuance of this contract make otherwise than for the benefit of the Company any notes or memoranda relating to any matter within the scope of this contract or concerning any of the Company's dealings or affairs nor shall you either during the continuance of this contract or afterwards use or permit to be used any such notes or memoranda otherwise than for the benefit of the Company, it being the intention that all such notes or memoranda made by the you shall be the property of the Company and shall be left with the Company on the termination or expiration of this contract and you shall return the same to the Company upon termination/expiration of this contract or at any time upon request of the Company together with an affidavit stating that no such written drawings, documents, etc. are retained by you.

12. The Employers processes follow ISO 9001 procedures and you should be familiar with the ISO processes at Canny and implement them in the employee's own sphere of activities.

13. You shall not at any time during the term of this Contract either on your behalf or on the behalf of any Third Person:

Canvass, solicit or endeavour to entice away from Canny or any Associated Company, any person, firm or establishment or company who shall at any time have been dealing with Canny or any Associated Company of Canny; or Accept from or perform for any Third Person, who shall at any time be a competitor of Canny or any Associated Company of Canny in the territory of employment according to this Contract, any business offered to the employee by such Third Person. The maximum conventional penalty in the case of a breach by you of this clause of the Contract shall be five months of the Salary which the Employer would have the right to demand at the time of the contravention.

14. This Contract shall be interpreted and governed by Indian Law. In the event that a dispute of any nature arises between the Parties, the Parties agree to submit the dispute to binding arbitration before a sole arbitrator appointed mutually by the Parties, failing which before a panel of three arbitrators consisting of one arbitrator each appointed by each of the Parties and a third arbitrator mutually appointed by the two arbitrators appointed by the Parties. All arbitration proceedings shall be conducted in the English Language and the place of Arbitration shall be in Mumbai in accordance with Arbitration and Conciliation Act, 1996 of India. Each Party shall co-operate in good faith to expedite (to the maximum extent practicable) the conduct of any arbitral proceedings commenced under this Contract. The costs and expenses of the arbitration, including without limitation, the fees of the arbitration and the arbitrators shall be borne equally by each party to the dispute or claim and each Party shall pay its own fees, disbursements and other charges of its counsel, except as may be determined otherwise by the arbitrators). The arbitrators) would have the power to award interest on any sum awarded pursuant to the arbitration proceedings and such sum would carry interest, if awarded, until the actual payment of such amounts. Each Party specifically waives his/her right to bring the dispute before the court of law and stipulates that this contract shall be a complete defence to any action instituted in any court or before any administrative tribunal.

15. Without limiting the remedies available to the Canny, you acknowledge that a breach of any of the covenants in this Contract may result in material irreparable injury to Canny and Cotecna Group of Companies for which there is no adequate remedy at law, and that it will not be possible to measure damages for such injuries precisely. You agree that if there is a breach or threatened breach, Canny or any member of the Cotecna Group Companies shall without prejudice to its other rights under this Contract or at law or equity, be entitled to apply for specific performance or injunctive or other equitable relief against you. All remedies provided by this Contract are cumulative, and not alternative. The recourse by Canny to one remedy shall not preclude it from seeking another remedy available to it under this Contract.

16. During the continuance of this contract if you become physically or mentally unfit for work and if the Company has satisfied itself of this fact on advice or proper medical authorities, the Company shall terminate this Contract without any notice or compensation.

17. If the Company has to close its business or curtail its activities due to circumstances beyond its control and if the Company finds that it is no longer possible to retain you any further, the Company shall have option to terminate this contract by giving you 15 days notice or paying 15 day's gross salary in lieu of notice. No further compensation will be payable by the Company in such case.

18. The Company shall have the right to suspend you or terminate this contract without any payment or without any notice or compensation for breach of this contract, insubordination, misconduct either inside or outside, corruption, dishonesty, theft, fraud, absenteeism, etc.

19. You agree to recognise that the services to be performed under this contract are necessary for the Company to fulfil its contractual obligations to its client and that the Company will suffer damages if the services are not performed fully and in time or performed without bringing to bear on them the necessary skill and experience possessed by you. Consequently, you agree that you shall not terminate this contract during its validity except with the written consent of the Company. Any breach of the provisions herein shall be liable to compensate the Company Without limiting the generality of the foregoing, you shall for any breach aforesaid be liable, at the minimum, to refund all the amounts paid to you by the Company. You also indemnify the Company against all losses, damages, adverse claims, litigation, charges, penalties which the Company may be subjected to by reason of his part performance/non-performance/delay in performance of any contractual obligations under this Contract.

20. This Contract set forth the entire contract and understanding between the parties with respect to the subject matter hereof and merges all previous contracts, discussions and negotiations between them; and none of the parties shall be bound by any conditions, representations, understandings or warranties with respect to such subject matter other than as expressly provided herein.

21. This Contract is executed in two copies. A signed copy of this Contract is to be held by both Parties.`;

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
    `${SUPABASE_MEDIA_URL_PREFIX}${SUPABASE_BUCKET.CANNY_ECOSYSTEM}/`,
  )
    ? url.slice(
      `${SUPABASE_MEDIA_URL_PREFIX}${SUPABASE_BUCKET.CANNY_ECOSYSTEM}/`
        .length,
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

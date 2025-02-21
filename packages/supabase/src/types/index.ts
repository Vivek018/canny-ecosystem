import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db";

export * from "./db";

export type Keys<T> = keyof T;
export type InferredType<T, K extends Keys<T>> = Pick<T, K>;

export type TypedSupabaseClient = SupabaseClient<Database>;

export type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

// Users
export type UserDatabaseRow = Database["public"]["Tables"]["users"]["Row"];
export type UserDatabaseInsert =
  Database["public"]["Tables"]["users"]["Insert"];
export type UserDatabaseUpdate =
  Database["public"]["Tables"]["users"]["Update"];

// Companies
export type CompaniesDatabaseRow = {
  id: Database["public"]["Tables"]["companies"]["Row"]["id"];
  name: Database["public"]["Tables"]["companies"]["Row"]["name"];
}[];

export type CompanyDatabaseRow =
  Database["public"]["Tables"]["companies"]["Row"];
export type CompanyDatabaseInsert =
  Database["public"]["Tables"]["companies"]["Insert"];
export type CompanyDatabaseUpdate =
  Database["public"]["Tables"]["companies"]["Update"];

// Company Registration Details
export type CompanyRegistrationDetailsRow =
  Database["public"]["Tables"]["company_registration_details"]["Row"];
export type CompanyRegistrationDetailsInsert =
  Database["public"]["Tables"]["company_registration_details"]["Insert"];
export type CompanyRegistrationDetailsUpdate =
  Database["public"]["Tables"]["company_registration_details"]["Update"];

// Company Locations
export type LocationDatabaseRow =
  Database["public"]["Tables"]["company_locations"]["Row"];
export type LocationDatabaseInsert =
  Database["public"]["Tables"]["company_locations"]["Insert"];
export type LocationDatabaseUpdate =
  Database["public"]["Tables"]["company_locations"]["Update"];

// Company Relationships
export type RelationshipDatabaseRow =
  Database["public"]["Tables"]["company_relationships"]["Row"];
export type RelationshipDatabaseInsert =
  Database["public"]["Tables"]["company_relationships"]["Insert"];
export type RelationshipDatabaseUpdate =
  Database["public"]["Tables"]["company_relationships"]["Update"];

// Projects
export type ProjectDatabaseRow =
  Database["public"]["Tables"]["projects"]["Row"];
export type ProjectDatabaseInsert =
  Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectDatabaseUpdate =
  Database["public"]["Tables"]["projects"]["Update"];

// Project Sites
export type SiteDatabaseRow =
  Database["public"]["Tables"]["project_sites"]["Row"];
export type SiteDatabaseInsert =
  Database["public"]["Tables"]["project_sites"]["Insert"];
export type SiteDatabaseUpdate =
  Database["public"]["Tables"]["project_sites"]["Update"];

// Pay Sequences
export type SitePaySequenceDatabaseRow =
  Database["public"]["Tables"]["site_pay_sequence"]["Row"];
export type SitePaySequenceDatabaseUpdate =
  Database["public"]["Tables"]["site_pay_sequence"]["Update"];

// Employees
export type EmployeeDatabaseRow =
  Database["public"]["Tables"]["employees"]["Row"];
export type EmployeeDatabaseInsert =
  Database["public"]["Tables"]["employees"]["Insert"];
export type EmployeeDatabaseUpdate =
  Database["public"]["Tables"]["employees"]["Update"];

// Attendance
export type EmployeeAttendanceDatabaseRow =
  Database["public"]["Tables"]["attendance"]["Row"];
export type EmployeeAttendanceDatabaseInsert =
  Database["public"]["Tables"]["attendance"]["Insert"];
export type EmployeeAttendanceDatabaseUpdate =
  Database["public"]["Tables"]["attendance"]["Update"];

// Employee Statutory Details
export type EmployeeStatutoryDetailsDatabaseRow =
  Database["public"]["Tables"]["employee_statutory_details"]["Row"];
export type EmployeeStatutoryDetailsDatabaseInsert =
  Database["public"]["Tables"]["employee_statutory_details"]["Insert"];
export type EmployeeStatutoryDetailsDatabaseUpdate =
  Database["public"]["Tables"]["employee_statutory_details"]["Update"];

// Employee Bank Details
export type EmployeeBankDetailsDatabaseRow =
  Database["public"]["Tables"]["employee_bank_details"]["Row"];
export type EmployeeBankDetailsDatabaseInsert =
  Database["public"]["Tables"]["employee_bank_details"]["Insert"];
export type EmployeeBankDetailsDatabaseUpdate =
  Database["public"]["Tables"]["employee_bank_details"]["Update"];

// Employee Addresses
export type EmployeeAddressDatabaseRow =
  Database["public"]["Tables"]["employee_addresses"]["Row"];
export type EmployeeAddressDatabaseInsert =
  Database["public"]["Tables"]["employee_addresses"]["Insert"];
export type EmployeeAddressDatabaseUpdate =
  Database["public"]["Tables"]["employee_addresses"]["Update"];

// Employee Guardians
export type EmployeeGuardianDatabaseRow =
  Database["public"]["Tables"]["employee_guardians"]["Row"];
export type EmployeeGuardianDatabaseInsert =
  Database["public"]["Tables"]["employee_guardians"]["Insert"];
export type EmployeeGuardianDatabaseUpdate =
  Database["public"]["Tables"]["employee_guardians"]["Update"];

// Employee Project Assignments
export type EmployeeProjectAssignmentDatabaseRow =
  Database["public"]["Tables"]["employee_project_assignment"]["Row"];
export type EmployeeProjectAssignmentDatabaseInsert =
  Database["public"]["Tables"]["employee_project_assignment"]["Insert"];
export type EmployeeProjectAssignmentDatabaseUpdate =
  Database["public"]["Tables"]["employee_project_assignment"]["Update"];

// Employee Skills
export type EmployeeSkillDatabaseRow =
  Database["public"]["Tables"]["employee_skills"]["Row"];
export type EmployeeSkillDatabaseInsert =
  Database["public"]["Tables"]["employee_skills"]["Insert"];
export type EmployeeSkillDatabaseUpdate =
  Database["public"]["Tables"]["employee_skills"]["Update"];

// Employee Work History
export type EmployeeWorkHistoryDatabaseRow =
  Database["public"]["Tables"]["employee_work_history"]["Row"];
export type EmployeeWorkHistoryDatabaseInsert =
  Database["public"]["Tables"]["employee_work_history"]["Insert"];
export type EmployeeWorkHistoryDatabaseUpdate =
  Database["public"]["Tables"]["employee_work_history"]["Update"];

// Feedback
export type FeedbackDatabaseRow =
  Database["public"]["Tables"]["feedback"]["Row"];
export type FeedbackDatabaseInsert =
  Database["public"]["Tables"]["feedback"]["Insert"];
export type FeedbackDatabaseUpdate =
  Database["public"]["Tables"]["feedback"]["Update"];

// Payment Fields
export type PaymentFieldDatabaseRow =
  Database["public"]["Tables"]["payment_fields"]["Row"];
export type PaymentFieldDatabaseInsert =
  Database["public"]["Tables"]["payment_fields"]["Insert"];
export type PaymentFieldDatabaseUpdate =
  Database["public"]["Tables"]["payment_fields"]["Update"];

// Statutory Bonus
export type StatutoryBonusDatabaseRow =
  Database["public"]["Tables"]["statutory_bonus"]["Row"];

export type StatutoryBonusDatabaseInsert =
  Database["public"]["Tables"]["statutory_bonus"]["Insert"];

export type StatutoryBonusDatabaseUpdate =
  Database["public"]["Tables"]["statutory_bonus"]["Update"];

export type EmployeeProvidentFundDatabaseRow =
  Database["public"]["Tables"]["employee_provident_fund"]["Row"];

export type EmployeeProvidentFundDatabaseInsert =
  Database["public"]["Tables"]["employee_provident_fund"]["Insert"];

export type EmployeeProvidentFundDatabaseUpdate =
  Database["public"]["Tables"]["employee_provident_fund"]["Update"];

export type EmployeeStateInsuranceDatabaseRow =
  Database["public"]["Tables"]["employee_state_insurance"]["Row"];

export type EmployeeStateInsuranceDatabaseInsert =
  Database["public"]["Tables"]["employee_state_insurance"]["Insert"];

export type EmployeeStateInsuranceDatabaseUpdate =
  Database["public"]["Tables"]["employee_state_insurance"]["Update"];

export type ProfessionalTaxDatabaseRow =
  Database["public"]["Tables"]["professional_tax"]["Row"];

export type ProfessionalTaxDatabaseInsert =
  Database["public"]["Tables"]["professional_tax"]["Insert"];

export type ProfessionalTaxDatabaseUpdate =
  Database["public"]["Tables"]["professional_tax"]["Update"];

export type ProfessionalTaxGrossSalaryRangeType = {
  start: number;
  end: number;
  value: number;
}[];

// Labour welfare funds
export type LabourWelfareFundDatabaseRow =
  Database["public"]["Tables"]["labour_welfare_fund"]["Row"];
export type LabourWelfareFundDatabaseInsert =
  Database["public"]["Tables"]["labour_welfare_fund"]["Insert"];
export type LabourWelfareFundDatabaseUpdate =
  Database["public"]["Tables"]["labour_welfare_fund"]["Update"];

// Payment templates
export type PaymentTemplateDatabaseRow =
  Database["public"]["Tables"]["payment_templates"]["Row"];
export type PaymentTemplateDatabaseInsert =
  Database["public"]["Tables"]["payment_templates"]["Insert"];
export type PaymentTemplateDatabaseUpdate =
  Database["public"]["Tables"]["payment_templates"]["Update"];

// Payment template assignment
export type PaymentTemplateAssignmentsDatabaseRow =
  Database["public"]["Tables"]["payment_template_assignments"]["Row"];
export type PaymentTemplateAssignmentsDatabaseInsert =
  Database["public"]["Tables"]["payment_template_assignments"]["Insert"];
export type PaymentTemplateAssignmentsDatabaseUpdate =
  Database["public"]["Tables"]["payment_template_assignments"]["Update"];

// Payment template components
export type PaymentTemplateComponentDatabaseRow =
  Database["public"]["Tables"]["payment_template_components"]["Row"];
export type PaymentTemplateComponentDatabaseInsert =
  Database["public"]["Tables"]["payment_template_components"]["Insert"];
export type PaymentTemplateComponentDatabaseUpdate =
  Database["public"]["Tables"]["payment_template_components"]["Update"];

// Payroll
export type PayrollDatabaseRow = Database["public"]["Tables"]["payroll"]["Row"];
export type PayrollDatabaseInsert =
  Database["public"]["Tables"]["payroll"]["Insert"];
export type PayrollDatabaseUpdate =
  Database["public"]["Tables"]["payroll"]["Update"];

// Payroll Entries
export type PayrollEntriesDatabaseRow =
  Database["public"]["Tables"]["payroll_entries"]["Row"];
export type PayrollEntriesDatabaseInsert =
  Database["public"]["Tables"]["payroll_entries"]["Insert"];
export type PayrollEntriesDatabaseUpdate =
  Database["public"]["Tables"]["payroll_entries"]["Update"];

// Reimbursement
export type ReimbursementInsert =
  Database["public"]["Tables"]["reimbursements"]["Insert"];
export type ReimbursementRow =
  Database["public"]["Tables"]["reimbursements"]["Row"];
export type ReimbursementsUpdate =
  Database["public"]["Tables"]["reimbursements"]["Update"];

// Exits
export type ExitsRow = Database["public"]["Tables"]["exits"]["Row"];
export type ExitsInsert = Database["public"]["Tables"]["exits"]["Insert"];
export type ExitsUpdate = Database["public"]["Tables"]["exits"]["Update"];

export type GratuityDatabaseRow =
  Database["public"]["Tables"]["gratuity"]["Row"];
export type GratuityDatabaseInsert =
  Database["public"]["Tables"]["gratuity"]["Insert"];
export type GratuityDatabaseUpdate =
  Database["public"]["Tables"]["gratuity"]["Update"];

export type EmployeeLetterDatabaseRow =
  Database["public"]["Tables"]["employee_letter"]["Row"];
export type EmployeeLetterDatabaseInsert =
  Database["public"]["Tables"]["employee_letter"]["Insert"];
export type EmployeeLetterDatabaseUpdate =
  Database["public"]["Tables"]["employee_letter"]["Update"];

export type LeaveEncashmentDatabaseRow =
  Database["public"]["Tables"]["leave_encashment"]["Row"];

export type LeaveEncashmentDatabaseInsert =
  Database["public"]["Tables"]["leave_encashment"]["Insert"];

export type LeaveEncashmentDatabaseUpdate =
  Database["public"]["Tables"]["leave_encashment"]["Update"];
export type AccidentsDatabaseRow =
  Database["public"]["Tables"]["accidents"]["Row"];
export type AccidentsDatabaseInsert =
  Database["public"]["Tables"]["accidents"]["Insert"];
export type AccidentsDatabaseUpdate =
  Database["public"]["Tables"]["accidents"]["Update"];

export type CasesDatabaseRow = Database["public"]["Tables"]["cases"]["Row"];
export type CasesDatabaseInsert =
  Database["public"]["Tables"]["cases"]["Insert"];
export type CasesDatabaseUpdate =
  Database["public"]["Tables"]["cases"]["Update"];

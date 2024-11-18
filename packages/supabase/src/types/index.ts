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

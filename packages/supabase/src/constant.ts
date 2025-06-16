export const SINGLE_QUERY_LIMIT = 1;
export const LAZY_LOADING_LIMIT = 40;
export const HARD_QUERY_LIMIT = 100;
export const MID_QUERY_LIMIT = 1000;
export const SOFT_QUERY_LIMIT = 10000;
export const MAX_QUERY_LIMIT = 20000;
export const LIST_LIMIT = 6;

export const ACCIDENTS_SQL = `SELECT 'accidents' AS table_name, row_to_json(t) AS data FROM (SELECT * FROM public.accidents LIMIT 1) t`;
export const ATTENDANCE_SQL = `SELECT 'attendance', row_to_json(t) FROM (SELECT * FROM public.attendance LIMIT 1) t`;
export const CASES_SQL = `SELECT 'cases', row_to_json(t) FROM (SELECT * FROM public.cases LIMIT 1) t`;
export const COMPANIES_SQL = `SELECT 'companies', row_to_json(t) FROM (SELECT * FROM public.companies LIMIT 1) t`;
export const COMPANY_DOCUMENTS_SQL = `SELECT 'company_documents', row_to_json(t) FROM (SELECT * FROM public.company_documents LIMIT 1) t`;
export const COMPANY_LOCATIONS_SQL = `SELECT 'company_locations', row_to_json(t) FROM (SELECT * FROM public.company_locations LIMIT 1) t`;
export const COMPANY_REG_DETAILS_SQL = `SELECT 'company_registration_details', row_to_json(t) FROM (SELECT * FROM public.company_registration_details LIMIT 1) t`;
export const COMPANY_RELATIONSHIPS_SQL = `SELECT 'company_relationships', row_to_json(t) FROM (SELECT * FROM public.company_relationships LIMIT 1) t`;
export const EMPLOYEE_ADDRESSES_SQL = `SELECT 'employee_addresses', row_to_json(t) FROM (SELECT * FROM public.employee_addresses LIMIT 1) t`;
export const EMPLOYEE_BANK_SQL = `SELECT 'employee_bank_details', row_to_json(t) FROM (SELECT * FROM public.employee_bank_details LIMIT 1) t`;
export const EMPLOYEE_DOCS_SQL = `SELECT 'employee_documents', row_to_json(t) FROM (SELECT * FROM public.employee_documents LIMIT 1) t`;
export const EMPLOYEE_GUARDIANS_SQL = `SELECT 'employee_guardians', row_to_json(t) FROM (SELECT * FROM public.employee_guardians LIMIT 1) t`;
export const EMPLOYEE_LETTER_SQL = `SELECT 'employee_letter', row_to_json(t) FROM (SELECT * FROM public.employee_letter LIMIT 1) t`;
export const EMPLOYEE_PROJECT_ASSIGNMENT_SQL = `SELECT 'employee_project_assignment', row_to_json(t) FROM (SELECT * FROM public.employee_project_assignment LIMIT 5) t`;
export const EMPLOYEE_SKILLS_SQL = `SELECT 'employee_skills', row_to_json(t) FROM (SELECT * FROM public.employee_skills LIMIT 1) t`;
export const EMPLOYEE_STATUTORY_SQL = `SELECT 'employee_statutory_details', row_to_json(t) FROM (SELECT * FROM public.employee_statutory_details LIMIT 1) t`;
export const EMPLOYEE_WORK_HISTORY_SQL = `SELECT 'employee_work_history', row_to_json(t) FROM (SELECT * FROM public.employee_work_history LIMIT 1) t`;
export const EMPLOYEES_SQL = `SELECT 'employees', row_to_json(t) FROM (SELECT * FROM public.employees LIMIT 1) t`;
export const EXITS_SQL = `SELECT 'exits', row_to_json(t) FROM (SELECT * FROM public.exits LIMIT 1) t`;
export const FEEDBACK_SQL = `SELECT 'feedback', row_to_json(t) FROM (SELECT * FROM public.feedback LIMIT 1) t`;
export const HOLIDAYS_SQL = `SELECT 'holidays', row_to_json(t) FROM (SELECT * FROM public.holidays LIMIT 1) t`;
export const INVOICE_SQL = `SELECT 'invoice', row_to_json(t) FROM (SELECT * FROM public.invoice LIMIT 1) t`;
export const LEAVE_TYPE_SQL = `SELECT 'leave_type', row_to_json(t) FROM (SELECT * FROM public.leave_type LIMIT 1) t`;
export const LEAVES_SQL = `SELECT 'leaves', row_to_json(t) FROM (SELECT * FROM public.leaves LIMIT 1) t`;
export const PAY_SEQUENCE_SQL = `SELECT 'pay_sequence', row_to_json(t) FROM (SELECT * FROM public.pay_sequence LIMIT 1) t`;
export const PAYROLL_SQL = `SELECT 'payroll', row_to_json(t) FROM (SELECT * FROM public.payroll LIMIT 1) t`;
export const PAYROLL_ENTRIES_SQL = `SELECT 'payroll_entries', row_to_json(t) FROM (SELECT * FROM public.payroll_entries LIMIT 5) t`;
export const PROJECT_SITES_SQL = `SELECT 'project_sites', row_to_json(t) FROM (SELECT * FROM public.project_sites LIMIT 1) t`;
export const PROJECTS_SQL = `SELECT 'projects', row_to_json(t) FROM (SELECT * FROM public.projects LIMIT 1) t`;
export const REIMBURSEMENTS_SQL = `SELECT 'reimbursements', row_to_json(t) FROM (SELECT * FROM public.reimbursements LIMIT 1) t`;
export const SALARY_ENTRIES_SQL = `SELECT 'salary_entries', row_to_json(t) FROM (SELECT * FROM public.salary_entries LIMIT 15) t`;
export const USERS_SQL = `SELECT 'users', row_to_json(t) FROM (SELECT * FROM public.users LIMIT 1) t`;

export const FETCH_ALL_ONE_SQL = [
  ACCIDENTS_SQL,
  ATTENDANCE_SQL,
  CASES_SQL,
  COMPANIES_SQL,
  COMPANY_DOCUMENTS_SQL,
  COMPANY_LOCATIONS_SQL,
  COMPANY_REG_DETAILS_SQL,
  COMPANY_RELATIONSHIPS_SQL,
  EMPLOYEE_ADDRESSES_SQL,
  EMPLOYEE_BANK_SQL,
  EMPLOYEE_DOCS_SQL,
  EMPLOYEE_GUARDIANS_SQL,
  EMPLOYEE_LETTER_SQL,
  EMPLOYEE_PROJECT_ASSIGNMENT_SQL,
  EMPLOYEE_SKILLS_SQL,
  EMPLOYEE_STATUTORY_SQL,
  EMPLOYEE_WORK_HISTORY_SQL,
  EMPLOYEES_SQL,
  EXITS_SQL,
  FEEDBACK_SQL,
  HOLIDAYS_SQL,
  INVOICE_SQL,
  LEAVE_TYPE_SQL,
  LEAVES_SQL,
  PAY_SEQUENCE_SQL,
  PAYROLL_SQL,
  PAYROLL_ENTRIES_SQL,
  PROJECT_SITES_SQL,
  PROJECTS_SQL,
  REIMBURSEMENTS_SQL,
  SALARY_ENTRIES_SQL,
  USERS_SQL,
].join(" UNION ALL\n");

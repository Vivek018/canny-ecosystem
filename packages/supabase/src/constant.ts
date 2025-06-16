export const SINGLE_QUERY_LIMIT = 1;
export const LAZY_LOADING_LIMIT = 40;
export const HARD_QUERY_LIMIT = 100;
export const MID_QUERY_LIMIT = 1000;
export const SOFT_QUERY_LIMIT = 10000;
export const MAX_QUERY_LIMIT = 20000;
export const LIST_LIMIT = 6;

export const FETCH_ALL_ONE_SQL = `SELECT 'incidents' AS table_name, row_to_json(t) AS data FROM (SELECT * FROM public.incidents LIMIT 1) t
UNION ALL
SELECT 'attendance', row_to_json(t) FROM (SELECT * FROM public.attendance LIMIT 1) t
UNION ALL
SELECT 'cases', row_to_json(t) FROM (SELECT * FROM public.cases LIMIT 1) t
UNION ALL
SELECT 'companies', row_to_json(t) FROM (SELECT * FROM public.companies LIMIT 1) t
UNION ALL
SELECT 'company_documents', row_to_json(t) FROM (SELECT * FROM public.company_documents LIMIT 1) t
UNION ALL
SELECT 'company_locations', row_to_json(t) FROM (SELECT * FROM public.company_locations LIMIT 1) t
UNION ALL
SELECT 'company_registration_details', row_to_json(t) FROM (SELECT * FROM public.company_registration_details LIMIT 1) t
UNION ALL
SELECT 'company_relationships', row_to_json(t) FROM (SELECT * FROM public.company_relationships LIMIT 1) t
UNION ALL
SELECT 'employee_addresses', row_to_json(t) FROM (SELECT * FROM public.employee_addresses LIMIT 1) t
UNION ALL
SELECT 'employee_bank_details', row_to_json(t) FROM (SELECT * FROM public.employee_bank_details LIMIT 1) t
UNION ALL
SELECT 'employee_documents', row_to_json(t) FROM (SELECT * FROM public.employee_documents LIMIT 1) t
UNION ALL
SELECT 'employee_guardians', row_to_json(t) FROM (SELECT * FROM public.employee_guardians LIMIT 1) t
UNION ALL
SELECT 'employee_letter', row_to_json(t) FROM (SELECT * FROM public.employee_letter LIMIT 1) t
UNION ALL
SELECT 'employee_project_assignment', row_to_json(t) FROM (SELECT * FROM public.employee_project_assignment LIMIT 1) t
UNION ALL
SELECT 'employee_skills', row_to_json(t) FROM (SELECT * FROM public.employee_skills LIMIT 1) t
UNION ALL
SELECT 'employee_statutory_details', row_to_json(t) FROM (SELECT * FROM public.employee_statutory_details LIMIT 1) t
UNION ALL
SELECT 'employee_work_history', row_to_json(t) FROM (SELECT * FROM public.employee_work_history LIMIT 1) t
UNION ALL
SELECT 'employees', row_to_json(t) FROM (SELECT * FROM public.employees LIMIT 1) t
UNION ALL
SELECT 'exits', row_to_json(t) FROM (SELECT * FROM public.exits LIMIT 1) t
UNION ALL
SELECT 'feedback', row_to_json(t) FROM (SELECT * FROM public.feedback LIMIT 1) t
UNION ALL
SELECT 'holidays', row_to_json(t) FROM (SELECT * FROM public.holidays LIMIT 1) t
UNION ALL
SELECT 'invoice', row_to_json(t) FROM (SELECT * FROM public.invoice LIMIT 1) t
UNION ALL
SELECT 'leave_type', row_to_json(t) FROM (SELECT * FROM public.leave_type LIMIT 1) t
UNION ALL
SELECT 'leaves', row_to_json(t) FROM (SELECT * FROM public.leaves LIMIT 1) t
UNION ALL
SELECT 'payroll', row_to_json(t) FROM (SELECT * FROM public.payroll LIMIT 1) t
UNION ALL
SELECT 'project_sites', row_to_json(t) FROM (SELECT * FROM public.project_sites LIMIT 1) t
UNION ALL
SELECT 'projects', row_to_json(t) FROM (SELECT * FROM public.projects LIMIT 1) t
UNION ALL
SELECT 'reimbursements', row_to_json(t) FROM (SELECT * FROM public.reimbursements LIMIT 1) t
UNION ALL
SELECT 'salary_entries', row_to_json(t) FROM (SELECT * FROM public.salary_entries LIMIT 15) t
UNION ALL
SELECT 'users', row_to_json(t) FROM (SELECT * FROM public.users LIMIT 1) t;
`
export const SINGLE_QUERY_LIMIT = 1;
export const LAZY_LOADING_LIMIT = 40;
export const HARD_QUERY_LIMIT = 100;
export const MID_QUERY_LIMIT = 1000;
export const SOFT_QUERY_LIMIT = 10000;
export const MAX_QUERY_LIMIT = 20000;
export const LIST_LIMIT = 6;

export const TABLE_SQL_SCHEMA = `-- WARNING: This schema is for context only and is not meant to be run.
--Table order and constraints may not be valid for execution.
  TABLE public.accidents (
  id,created_at,employee_id,title,date,location,category,status,description,medical_diagnosis,location_type,severity,updated_at,CONSTRAINT,CONSTRAINT accidents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.attendance (
  id,date,no_of_hours,present,holiday,employee_id,working_shift,created_at,updated_at,holiday_type,CONSTRAINT,CONSTRAINT employee_attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.cases (
  id,title,description,status,case_type,reported_on USER-DEFINED NOT NULL DEFAULT 'employee,
  reported_on_project_id,reported_by USER-DEFINED NOT NULL DEFAULT 'employee,
  reported_by_project_id,date,incident_date,location,location_type USER-DEFINED NOT NULL DEFAULT 'employee,
  document,resolution_date,amount_given,amount_received,court_case_reference,created_at,updated_at,company_id,reported_by_site_id,reported_by_company_id,reported_by_employee_id,reported_on_site_id,reported_on_company_id,reported_on_employee_id,CONSTRAINT,CONSTRAINT cases_reported_by_site_id_fkey FOREIGN KEY (reported_by_site_id,CONSTRAINT cases_reported_by_project_id_fkey FOREIGN KEY (reported_by_project_id,CONSTRAINT cases_reported_by_employee_id_fkey FOREIGN KEY (reported_by_employee_id,CONSTRAINT cases_reported_by_company_id_fkey FOREIGN KEY (reported_by_company_id,CONSTRAINT cases_company_id_fkey FOREIGN KEY (company_id) REFERENCES,CONSTRAINT cases_reported_on_company_id_fkey FOREIGN KEY (reported_on_company_id,CONSTRAINT cases_reported_on_project_id_fkey FOREIGN KEY (reported_on_project_id,CONSTRAINT cases_reported_on_site_id_fkey FOREIGN KEY (reported_on_site_id,CONSTRAINT cases_reported_on_employee_id_fkey FOREIGN KEY (reported_on_employee_id) REFERENCES public.employees(id)
);
  TABLE public.companies (
  id,name,logo,email_suffix,company_type character varying NOT NULL DEFAULT 'project_client'::character varying CHECK (company_type::text = AN(ARRAY, 'project_client,company_size character varying NOT NULL DEFAULT 'medium'::character varying CHECK (company_size::text = ANY (ARRAY['small'::charactevarying, 'large, 'enterprise'::character varying,
  is_active,updated_at,created_at,CONSTRAINT companies_pkey PRIMARY KEY (id)
);
  TABLE public.company_documents (
  id,company_id,name,url,created_at,updated_at,CONSTRAINT,CONSTRAINT company_documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
  TABLE public.company_locations (
  id,company_id,address_line_1,address_line_2,city,state,pincode,is_primary,latitude,longitude,created_at,updated_at,name,CONSTRAINT,CONSTRAINT company_locations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
  TABLE public.company_registration_details (
  company_id,registration_number,pan_number,gst_number,pf_number,esic_number,pt_number,lwf_number,created_at,updated_at,CONSTRAINT company_registration_details_pkey PRIMARY KEY (company_id,CONSTRAINT company_registration_details_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
  TABLE public.company_relationships (
  id,parent_company_id,child_company_id,start_date,end_date,terms,is_active,created_at,updated_at,relationship_type,CONSTRAINT,CONSTRAINT company_relationships_child_company_id_fkey FOREIGN KEY (child_company_id,CONSTRAINT company_relationships_parent_company_id_fkey FOREIGN KEY (parent_company_id) REFERENCES public.companies(id)
);
  TABLE public.employee_addresses (
  id,employee_id,address_type,address_line_1,address_line_2,city,state,country,pincode,is_primary,created_at,updated_at,latitude,longitude,CONSTRAINT,CONSTRAINT employee_addresses_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.employee_bank_details (
  employee_id,account_holder_name,bank_name,account_number,ifsc_code,branch_name,created_at,updated_at,account_type,CONSTRAINT,CONSTRAINT employee_bank_details_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.employee_documents (
  id,employee_id,document_type,url,created_at,updated_at,CONSTRAINT,CONSTRAINT employee_documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.employee_guardians (
  id,employee_id,relationship,first_name,last_name,date_of_birth,gender,mobile_number,alternate_mobile_number,email,is_emergency_contact,address_same_as_employee,created_at,updated_at,CONSTRAINT,CONSTRAINT employee_guardians_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.employee_letter (
  id,date,subject,content,include_letter_head,include_signatuory,include_our_address,include_client_address,include_employee_address,created_at,updated_at,employee_id,letter_type,include_employee_signature,CONSTRAINT,CONSTRAINT employee_letter_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.employee_project_assignment (
  employee_id,project_site_id,position,start_date,end_date,created_at,updated_at,assignment_type character varying DEFAULT 'full_time'::character varyin,skill_level,probation_period,probation_end_date,CONSTRAINT employee_project_assignment_pkey PRIMARY KEY (employee_id,CONSTRAINT employee_project_assignments_project_site_id_fkey FOREIGN,CONSTRAINT employee_project_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.employee_skills (
  id,employee_id,skill_name,proficiency character varying NOT NULL DEFAULT 'beginner,
  years_of_experience,created_at,updated_at,CONSTRAINT,CONSTRAINT employee_skills_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.employee_statutory_details (
  employee_id,aadhaar_number,pan_number,uan_number,pf_number,esic_number,driving_license_number,driving_license_expiry,passport_number,passport_expiry,created_at,updated_at,CONSTRAINT employee_statutory_details_pkey PRIMARY KEY (employee_id,
  CONSTRAINT employee_statutory_details_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.employee_work_history (
  id,employee_id,company_name,position,start_date,end_date,responsibilities,created_at,updated_at,CONSTRAINT,CONSTRAINT employee_work_history_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.employees (
  id,employee_code,first_name,middle_name,last_name,date_of_birth,gender character varying NOT NULL DEFAULT 'male'::character varyinCHECK, 'female, 'other'::character varying,
  education,marital_status character varying DEFAULT 'unmarried'::character varyin,nationality,primary_mobile_number,secondary_mobile_number,personal_email,is_active,created_at,updated_at,company_id,photo,fts_vector,CONSTRAINT,CONSTRAINT employees_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
  TABLE public.exits (
  id,employee_id,organization_payable_days,employee_payable_days,last_working_day,final_settlement_date,reason,note,created_at,updated_at,net_pay,leave_encashment,gratuity,deduction,bonus,CONSTRAINT,CONSTRAINT exits_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.feedback (
  id,subject,category,severity,message,user_id,company_id,created_at,updated_at,CONSTRAINT,CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public,CONSTRAINT feedback_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
  TABLE public.holidays (
  id,company_id,name,is_mandatory,start_date,no_of_days,created_at,updated_at,CONSTRAINT,CONSTRAINT holidays_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
  TABLE public.invoice (
  id,invoice_number,date,subject,company_address_id,payroll_data,payroll_id,include_charge,include_cgst,include_sgst,include_igst,include_proof,proof,is_paid,updated_at,created_at,payroll_type,company_id,include_header,invoice_type,CONSTRAINT,CONSTRAINT invoice_company_address_id_fkey FOREIGN KEY (company_address_id,CONSTRAINT invoice_payroll_id_fkey FOREIGN KEY (payroll_id) REFERENCES,CONSTRAINT invoice_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
  TABLE public.leave_type (
  id,created_at,updated_at,company_id,leave_type,leaves_per_year,CONSTRAINT,CONSTRAINT leave_type_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
  TABLE public.leaves (
  id,employee_id,start_date,end_date,reason,created_at,updated_at,leave_type,user_id,CONSTRAINT,CONSTRAINT leaves_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES,CONSTRAINT leaves_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
  TABLE public.pay_sequence (
  working_days,pay_day,created_at,id,company_id,overtime_multiplier,name,is_default,CONSTRAINT,CONSTRAINT pay_sequence_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
  TABLE public.payroll (
  id,status,run_date,total_net_amount,total_employees,created_at,updated_at,payroll_type,company_id,title,CONSTRAINT,CONSTRAINT payroll_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
  TABLE public.payroll_entries (
  id,employee_id,payroll_id,amount,payment_status,created_at,updated_at,reimbursement_id,exit_id,CONSTRAINT,CONSTRAINT payroll_entries_employee_id_fkey FOREIGN KEY (employee_id,CONSTRAINT payroll_entries_exit_id_fkey FOREIGN KEY (exit_id) REFERENCES,CONSTRAINT payroll_entries_reimbursement_id_fkey FOREIGN KEY (reimbursement_id,CONSTRAINT payroll_entries_payroll_id_fkey FOREIGN KEY (payroll_id) REFERENCES public.payroll(id)
);
  TABLE public.project_sites (
  id,project_id,name,site_code,latitude,longitude,capacity,is_active,created_at,updated_at,company_location_id,address_line_1,address_line_2,city,state,pincode,CONSTRAINT,CONSTRAINT project_sites_company_address_id_fkey FOREIGN KEY (company_location_id,CONSTRAINT project_sites_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
  TABLE public.projects (
  id,name,project_code,description,end_client_id,project_client_id,primary_contractor_id,start_date,estimated_end_date,actual_end_date,status,risk_assessment,quality_standards,health_safety_requirements,environmental_considerations,
  created_at,updated_at,project_type,CONSTRAINT,CONSTRAINT projects_project_client_id_fkey FOREIGN KEY (project_client_id,CONSTRAINT projects_primary_contractor_id_fkey FOREIGN KEY (primary_contractor_id,CONSTRAINT projects_end_client_id_fkey FOREIGN KEY (end_client_id) REFERENCES public.companies(id)
);
  TABLE public.reimbursements (
  id,employee_id,is_deductible,status, 'rejected'::character varying]::text[]))amount,created_at,updated_at,submitted_date,user_id,CONSTRAINT,CONSTRAINT reimbursements_user_id_fkey FOREIGN KEY (user_id) REFERENCES,CONSTRAINT reimbursements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
  TABLE public.salary_entries (
  id,created_at,updated_at,month,year,present_days,overtime_hours,employee_id,template_component_id,payroll_id,field_name,type,is_pro_rata,amount,consider_for_epf,consider_for_esic,is_overtime,CONSTRAINT,CONSTRAINT salary_entries_payroll_id_fkey FOREIGN KEY (payroll_id) REFERENCES,CONSTRAINT salary_entries_employee_id_fkey FOREIGN KEY (employee_id,
  CONSTRAINT salary_entries_template_component_id_fkey FOREIGN KEY (template_component_id) REFERENCES public.payment_template_components(id)
);
TABLE public.users (
  id,first_name,last_name,email,mobile_number,avatar,is_email_verified,is_mobile_verified,preferred_language character varying DEFAULT 'en'::character varyin,
  last_login,company_id,is_active,created_at,updated_at,role,site_id,CONSTRAINT,CONSTRAINT users_site_id_fkey FOREIGN KEY (site_id) REFERENCES public,CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);`;
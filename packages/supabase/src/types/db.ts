export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          company_size: string;
          company_type: string;
          created_at: string | null;
          email_suffix: string | null;
          id: string;
          is_active: boolean | null;
          logo: string | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          company_size?: string;
          company_type?: string;
          created_at?: string | null;
          email_suffix?: string | null;
          id?: string;
          is_active?: boolean | null;
          logo?: string | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          company_size?: string;
          company_type?: string;
          created_at?: string | null;
          email_suffix?: string | null;
          id?: string;
          is_active?: boolean | null;
          logo?: string | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      company_locations: {
        Row: {
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          company_id: string | null;
          created_at: string | null;
          id: string;
          is_primary: boolean | null;
          latitude: number | null;
          longitude: number | null;
          name: string;
          pincode: string;
          state: string;
          updated_at: string | null;
        };
        Insert: {
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          company_id?: string | null;
          created_at?: string | null;
          id?: string;
          is_primary?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          pincode: string;
          state: string;
          updated_at?: string | null;
        };
        Update: {
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          company_id?: string | null;
          created_at?: string | null;
          id?: string;
          is_primary?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          pincode?: string;
          state?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_locations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      company_registration_details: {
        Row: {
          company_id: string;
          created_at: string | null;
          esic_number: string | null;
          gst_number: string | null;
          lwf_number: string | null;
          pan_number: string | null;
          pf_number: string | null;
          pt_number: string | null;
          registration_number: string | null;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          esic_number?: string | null;
          gst_number?: string | null;
          lwf_number?: string | null;
          pan_number?: string | null;
          pf_number?: string | null;
          pt_number?: string | null;
          registration_number?: string | null;
          updated_at?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          esic_number?: string | null;
          gst_number?: string | null;
          lwf_number?: string | null;
          pan_number?: string | null;
          pf_number?: string | null;
          pt_number?: string | null;
          registration_number?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_registration_details_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: true;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      company_relationships: {
        Row: {
          child_company_id: string | null;
          created_at: string | null;
          end_date: string | null;
          id: string;
          is_active: boolean | null;
          parent_company_id: string;
          relationship_type: string | null;
          start_date: string;
          terms: Json | null;
          updated_at: string | null;
        };
        Insert: {
          child_company_id?: string | null;
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          parent_company_id: string;
          relationship_type?: string | null;
          start_date?: string;
          terms?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          child_company_id?: string | null;
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          parent_company_id?: string;
          relationship_type?: string | null;
          start_date?: string;
          terms?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_relationships_child_company_id_fkey";
            columns: ["child_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_relationships_parent_company_id_fkey";
            columns: ["parent_company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_addresses: {
        Row: {
          address_line_1: string | null;
          address_line_2: string | null;
          address_type: string | null;
          city: string | null;
          country: string | null;
          created_at: string | null;
          employee_id: string;
          id: string;
          is_primary: boolean | null;
          latitude: number | null;
          longitude: number | null;
          pincode: string | null;
          state: string | null;
          updated_at: string | null;
        };
        Insert: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          address_type?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          employee_id: string;
          id?: string;
          is_primary?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          pincode?: string | null;
          state?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          address_type?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          employee_id?: string;
          id?: string;
          is_primary?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          pincode?: string | null;
          state?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_addresses_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_attendance: {
        Row: {
          created_at: string | null;
          date: string | null;
          employee_id: string | null;
          holiday: boolean | null;
          id: string;
          no_of_hours: number | null;
          present: boolean | null;
          site_id: string | null;
          total_working_days: number | null;
          updated_at: string | null;
          working_shift: Database["public"]["Enums"]["working_shift"] | null;
        };
        Insert: {
          created_at?: string | null;
          date?: string | null;
          employee_id?: string | null;
          holiday?: boolean | null;
          id?: string;
          no_of_hours?: number | null;
          present?: boolean | null;
          site_id?: string | null;
          total_working_days?: number | null;
          updated_at?: string | null;
          working_shift?: Database["public"]["Enums"]["working_shift"] | null;
        };
        Update: {
          created_at?: string | null;
          date?: string | null;
          employee_id?: string | null;
          holiday?: boolean | null;
          id?: string;
          no_of_hours?: number | null;
          present?: boolean | null;
          site_id?: string | null;
          total_working_days?: number | null;
          updated_at?: string | null;
          working_shift?: Database["public"]["Enums"]["working_shift"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_attendance_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "project_sites";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_bank_details: {
        Row: {
          account_holder_name: string | null;
          account_number: string | null;
          account_type: string;
          bank_name: string | null;
          branch_name: string | null;
          created_at: string | null;
          employee_id: string;
          ifsc_code: string | null;
          updated_at: string | null;
        };
        Insert: {
          account_holder_name?: string | null;
          account_number?: string | null;
          account_type?: string;
          bank_name?: string | null;
          branch_name?: string | null;
          created_at?: string | null;
          employee_id: string;
          ifsc_code?: string | null;
          updated_at?: string | null;
        };
        Update: {
          account_holder_name?: string | null;
          account_number?: string | null;
          account_type?: string;
          bank_name?: string | null;
          branch_name?: string | null;
          created_at?: string | null;
          employee_id?: string;
          ifsc_code?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_bank_details_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: true;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_guardians: {
        Row: {
          address_same_as_employee: boolean | null;
          alternate_mobile_number: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          email: string | null;
          employee_id: string;
          first_name: string | null;
          gender: string | null;
          id: string;
          is_emergency_contact: boolean | null;
          last_name: string | null;
          mobile_number: string | null;
          relationship: string | null;
          updated_at: string | null;
        };
        Insert: {
          address_same_as_employee?: boolean | null;
          alternate_mobile_number?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          employee_id: string;
          first_name?: string | null;
          gender?: string | null;
          id?: string;
          is_emergency_contact?: boolean | null;
          last_name?: string | null;
          mobile_number?: string | null;
          relationship?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address_same_as_employee?: boolean | null;
          alternate_mobile_number?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          email?: string | null;
          employee_id?: string;
          first_name?: string | null;
          gender?: string | null;
          id?: string;
          is_emergency_contact?: boolean | null;
          last_name?: string | null;
          mobile_number?: string | null;
          relationship?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_guardians_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_project_assignment: {
        Row: {
          assignment_type: string | null;
          created_at: string | null;
          employee_id: string;
          end_date: string | null;
          position: string;
          probation_end_date: string | null;
          probation_period: boolean | null;
          project_site_id: string;
          skill_level: string | null;
          start_date: string;
          supervisor_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          assignment_type?: string | null;
          created_at?: string | null;
          employee_id: string;
          end_date?: string | null;
          position: string;
          probation_end_date?: string | null;
          probation_period?: boolean | null;
          project_site_id: string;
          skill_level?: string | null;
          start_date: string;
          supervisor_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          assignment_type?: string | null;
          created_at?: string | null;
          employee_id?: string;
          end_date?: string | null;
          position?: string;
          probation_end_date?: string | null;
          probation_period?: boolean | null;
          project_site_id?: string;
          skill_level?: string | null;
          start_date?: string;
          supervisor_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_project_assignments_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: true;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_project_assignments_project_site_id_fkey";
            columns: ["project_site_id"];
            isOneToOne: false;
            referencedRelation: "project_sites";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_project_assignments_supervisor_id_fkey";
            columns: ["supervisor_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_provident_fund: {
        Row: {
          company_id: string;
          created_at: string | null;
          deduction_cycle: string;
          employee_contribution: number;
          employee_restrict_value: number | null;
          employer_contribution: number;
          employer_restrict_value: number | null;
          epf_number: string;
          id: string;
          include_admin_charges: boolean | null;
          include_employer_contribution: boolean | null;
          include_employer_edli_contribution: boolean | null;
          is_default: boolean | null;
          restrict_employee_contribution: boolean | null;
          restrict_employer_contribution: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          deduction_cycle?: string;
          employee_contribution?: number;
          employee_restrict_value?: number | null;
          employer_contribution?: number;
          employer_restrict_value?: number | null;
          epf_number: string;
          id?: string;
          include_admin_charges?: boolean | null;
          include_employer_contribution?: boolean | null;
          include_employer_edli_contribution?: boolean | null;
          is_default?: boolean | null;
          restrict_employee_contribution?: boolean | null;
          restrict_employer_contribution?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          deduction_cycle?: string;
          employee_contribution?: number;
          employee_restrict_value?: number | null;
          employer_contribution?: number;
          employer_restrict_value?: number | null;
          epf_number?: string;
          id?: string;
          include_admin_charges?: boolean | null;
          include_employer_contribution?: boolean | null;
          include_employer_edli_contribution?: boolean | null;
          is_default?: boolean | null;
          restrict_employee_contribution?: boolean | null;
          restrict_employer_contribution?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_provident_fund_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_skills: {
        Row: {
          created_at: string | null;
          employee_id: string;
          id: string;
          proficiency: string;
          skill_name: string;
          updated_at: string | null;
          years_of_experience: number | null;
        };
        Insert: {
          created_at?: string | null;
          employee_id: string;
          id?: string;
          proficiency?: string;
          skill_name: string;
          updated_at?: string | null;
          years_of_experience?: number | null;
        };
        Update: {
          created_at?: string | null;
          employee_id?: string;
          id?: string;
          proficiency?: string;
          skill_name?: string;
          updated_at?: string | null;
          years_of_experience?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_skills_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_state_insurance: {
        Row: {
          company_id: string;
          created_at: string | null;
          deduction_cycle: string;
          employees_contribution: number;
          employers_contribution: number;
          esi_number: string;
          id: string;
          include_employer_contribution: boolean;
          is_default: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          deduction_cycle?: string;
          employees_contribution?: number;
          employers_contribution?: number;
          esi_number: string;
          id?: string;
          include_employer_contribution?: boolean;
          is_default?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          deduction_cycle?: string;
          employees_contribution?: number;
          employers_contribution?: number;
          esi_number?: string;
          id?: string;
          include_employer_contribution?: boolean;
          is_default?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_state_insurance_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_statutory_details: {
        Row: {
          aadhaar_number: string | null;
          created_at: string | null;
          driving_license_expiry: string | null;
          driving_license_number: string | null;
          employee_id: string;
          esic_number: string | null;
          pan_number: string | null;
          passport_expiry: string | null;
          passport_number: string | null;
          pf_number: string | null;
          uan_number: string | null;
          updated_at: string | null;
        };
        Insert: {
          aadhaar_number?: string | null;
          created_at?: string | null;
          driving_license_expiry?: string | null;
          driving_license_number?: string | null;
          employee_id: string;
          esic_number?: string | null;
          pan_number?: string | null;
          passport_expiry?: string | null;
          passport_number?: string | null;
          pf_number?: string | null;
          uan_number?: string | null;
          updated_at?: string | null;
        };
        Update: {
          aadhaar_number?: string | null;
          created_at?: string | null;
          driving_license_expiry?: string | null;
          driving_license_number?: string | null;
          employee_id?: string;
          esic_number?: string | null;
          pan_number?: string | null;
          passport_expiry?: string | null;
          passport_number?: string | null;
          pf_number?: string | null;
          uan_number?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_statutory_details_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: true;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_work_history: {
        Row: {
          company_name: string;
          created_at: string | null;
          employee_id: string;
          end_date: string | null;
          id: string;
          position: string;
          responsibilities: string | null;
          start_date: string;
          updated_at: string | null;
        };
        Insert: {
          company_name: string;
          created_at?: string | null;
          employee_id: string;
          end_date?: string | null;
          id?: string;
          position: string;
          responsibilities?: string | null;
          start_date: string;
          updated_at?: string | null;
        };
        Update: {
          company_name?: string;
          created_at?: string | null;
          employee_id?: string;
          end_date?: string | null;
          id?: string;
          position?: string;
          responsibilities?: string | null;
          start_date?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employee_work_history_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      employees: {
        Row: {
          company_id: string;
          created_at: string | null;
          date_of_birth: string;
          education: string | null;
          employee_code: string;
          first_name: string;
          fts_vector: unknown | null;
          gender: string;
          id: string;
          is_active: boolean | null;
          last_name: string;
          marital_status: string | null;
          middle_name: string | null;
          nationality: string | null;
          personal_email: string | null;
          photo: string | null;
          primary_mobile_number: string;
          secondary_mobile_number: string | null;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          date_of_birth: string;
          education?: string | null;
          employee_code: string;
          first_name: string;
          fts_vector?: unknown | null;
          gender?: string;
          id?: string;
          is_active?: boolean | null;
          last_name: string;
          marital_status?: string | null;
          middle_name?: string | null;
          nationality?: string | null;
          personal_email?: string | null;
          photo?: string | null;
          primary_mobile_number: string;
          secondary_mobile_number?: string | null;
          updated_at?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          date_of_birth?: string;
          education?: string | null;
          employee_code?: string;
          first_name?: string;
          fts_vector?: unknown | null;
          gender?: string;
          id?: string;
          is_active?: boolean | null;
          last_name?: string;
          marital_status?: string | null;
          middle_name?: string | null;
          nationality?: string | null;
          personal_email?: string | null;
          photo?: string | null;
          primary_mobile_number?: string;
          secondary_mobile_number?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      exit_payments: {
        Row: {
          amount: number;
          created_at: string | null;
          exit_id: string;
          id: string;
          payment_fields_id: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          exit_id: string;
          id?: string;
          payment_fields_id: string;
          type?: string;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          exit_id?: string;
          id?: string;
          payment_fields_id?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "exit_payments_exit_id_fkey";
            columns: ["exit_id"];
            isOneToOne: false;
            referencedRelation: "exits";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exit_payments_payment_fields_id_fkey";
            columns: ["payment_fields_id"];
            isOneToOne: false;
            referencedRelation: "payment_fields";
            referencedColumns: ["id"];
          },
        ];
      };
      exits: {
        Row: {
          created_at: string | null;
          employee_id: string;
          employee_payable_days: number;
          final_settlement_date: string;
          id: string;
          last_working_day: string;
          note: string | null;
          organization_payable_days: number;
          reason: string;
          total: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          employee_id: string;
          employee_payable_days: number;
          final_settlement_date: string;
          id?: string;
          last_working_day: string;
          note?: string | null;
          organization_payable_days: number;
          reason: string;
          total?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          employee_id?: string;
          employee_payable_days?: number;
          final_settlement_date?: string;
          id?: string;
          last_working_day?: string;
          note?: string | null;
          organization_payable_days?: number;
          reason?: string;
          total?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "exits_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: true;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback: {
        Row: {
          category: Database["public"]["Enums"]["feedback_category"] | null;
          company_id: string;
          created_at: string;
          id: string;
          message: string;
          severity: Database["public"]["Enums"]["feedback_severity"] | null;
          subject: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: Database["public"]["Enums"]["feedback_category"] | null;
          company_id: string;
          created_at?: string;
          id?: string;
          message: string;
          severity?: Database["public"]["Enums"]["feedback_severity"] | null;
          subject: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["feedback_category"] | null;
          company_id?: string;
          created_at?: string;
          id?: string;
          message?: string;
          severity?: Database["public"]["Enums"]["feedback_severity"] | null;
          subject?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      gratuity: {
        Row: {
          company_id: string;
          created_at: string | null;
          eligibility_years: number | null;
          id: string;
          is_default: boolean | null;
          max_amount_limit: number | null;
          max_multiply_limit: number | null;
          payment_days_per_year: number | null;
          present_day_per_year: number | null;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          eligibility_years?: number | null;
          id?: string;
          is_default?: boolean | null;
          max_amount_limit?: number | null;
          max_multiply_limit?: number | null;
          payment_days_per_year?: number | null;
          present_day_per_year?: number | null;
          updated_at?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          eligibility_years?: number | null;
          id?: string;
          is_default?: boolean | null;
          max_amount_limit?: number | null;
          max_multiply_limit?: number | null;
          payment_days_per_year?: number | null;
          present_day_per_year?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "gratuity_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      labour_welfare_fund: {
        Row: {
          company_id: string;
          created_at: string | null;
          deduction_cycle: string;
          employee_contribution: number;
          employer_contribution: number;
          id: string;
          state: string;
          status: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          deduction_cycle?: string;
          employee_contribution: number;
          employer_contribution: number;
          id?: string;
          state: string;
          status?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          deduction_cycle?: string;
          employee_contribution?: number;
          employer_contribution?: number;
          id?: string;
          state?: string;
          status?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "labour_welfare_fund_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_fields: {
        Row: {
          amount: number | null;
          calculation_type: Database["public"]["Enums"]["calculation_type"];
          company_id: string | null;
          consider_for_epf: boolean | null;
          consider_for_esic: boolean | null;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          is_pro_rata: boolean | null;
          name: string;
          payment_type: Database["public"]["Enums"]["payment_type"];
          updated_at: string | null;
        };
        Insert: {
          amount?: number | null;
          calculation_type: Database["public"]["Enums"]["calculation_type"];
          company_id?: string | null;
          consider_for_epf?: boolean | null;
          consider_for_esic?: boolean | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_pro_rata?: boolean | null;
          name: string;
          payment_type: Database["public"]["Enums"]["payment_type"];
          updated_at?: string | null;
        };
        Update: {
          amount?: number | null;
          calculation_type?: Database["public"]["Enums"]["calculation_type"];
          company_id?: string | null;
          consider_for_epf?: boolean | null;
          consider_for_esic?: boolean | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_pro_rata?: boolean | null;
          name?: string;
          payment_type?: Database["public"]["Enums"]["payment_type"];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_fields_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_template_assignments: {
        Row: {
          assignment_type: Database["public"]["Enums"]["template_assignment_type"];
          created_at: string | null;
          effective_from: string;
          effective_to: string | null;
          eligibility_option:
            | Database["public"]["Enums"]["eligibility_option_type"]
            | null;
          employee_id: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          position: string | null;
          site_id: string | null;
          skill_level: string | null;
          template_id: string;
          updated_at: string | null;
        };
        Insert: {
          assignment_type: Database["public"]["Enums"]["template_assignment_type"];
          created_at?: string | null;
          effective_from: string;
          effective_to?: string | null;
          eligibility_option?:
            | Database["public"]["Enums"]["eligibility_option_type"]
            | null;
          employee_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          position?: string | null;
          site_id?: string | null;
          skill_level?: string | null;
          template_id: string;
          updated_at?: string | null;
        };
        Update: {
          assignment_type?: Database["public"]["Enums"]["template_assignment_type"];
          created_at?: string | null;
          effective_from?: string;
          effective_to?: string | null;
          eligibility_option?:
            | Database["public"]["Enums"]["eligibility_option_type"]
            | null;
          employee_id?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          position?: string | null;
          site_id?: string | null;
          skill_level?: string | null;
          template_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_template_assignments_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_template_assignments_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "project_sites";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_template_assignments_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "payment_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_template_components: {
        Row: {
          bonus_id: string | null;
          calculation_type:
            | Database["public"]["Enums"]["template_calculation_type"]
            | null;
          calculation_value: number | null;
          component_type: Database["public"]["Enums"]["template_component_type"];
          created_at: string | null;
          display_order: number | null;
          epf_id: string | null;
          esi_id: string | null;
          id: string;
          lwf_id: string | null;
          payment_field_id: string | null;
          pt_id: string | null;
          target_type: Database["public"]["Enums"]["assignment_target_type"];
          template_id: string;
          updated_at: string | null;
        };
        Insert: {
          bonus_id?: string | null;
          calculation_type?:
            | Database["public"]["Enums"]["template_calculation_type"]
            | null;
          calculation_value?: number | null;
          component_type: Database["public"]["Enums"]["template_component_type"];
          created_at?: string | null;
          display_order?: number | null;
          epf_id?: string | null;
          esi_id?: string | null;
          id?: string;
          lwf_id?: string | null;
          payment_field_id?: string | null;
          pt_id?: string | null;
          target_type: Database["public"]["Enums"]["assignment_target_type"];
          template_id: string;
          updated_at?: string | null;
        };
        Update: {
          bonus_id?: string | null;
          calculation_type?:
            | Database["public"]["Enums"]["template_calculation_type"]
            | null;
          calculation_value?: number | null;
          component_type?: Database["public"]["Enums"]["template_component_type"];
          created_at?: string | null;
          display_order?: number | null;
          epf_id?: string | null;
          esi_id?: string | null;
          id?: string;
          lwf_id?: string | null;
          payment_field_id?: string | null;
          pt_id?: string | null;
          target_type?: Database["public"]["Enums"]["assignment_target_type"];
          template_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_template_components_bonus_id_fkey";
            columns: ["bonus_id"];
            isOneToOne: false;
            referencedRelation: "statutory_bonus";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_template_components_epf_id_fkey";
            columns: ["epf_id"];
            isOneToOne: false;
            referencedRelation: "employee_provident_fund";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_template_components_esi_id_fkey";
            columns: ["esi_id"];
            isOneToOne: false;
            referencedRelation: "employee_state_insurance";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_template_components_lwf_id_fkey";
            columns: ["lwf_id"];
            isOneToOne: false;
            referencedRelation: "labour_welfare_fund";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_template_components_payment_field_id_fkey";
            columns: ["payment_field_id"];
            isOneToOne: false;
            referencedRelation: "payment_fields";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_template_components_pt_id_fkey";
            columns: ["pt_id"];
            isOneToOne: false;
            referencedRelation: "professional_tax";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_template_components_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "payment_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_templates: {
        Row: {
          annual_ctc: number;
          company_id: string;
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          is_default: boolean | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          annual_ctc: number;
          company_id: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          annual_ctc?: number;
          company_id?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_templates_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      payroll: {
        Row: {
          commission: number | null;
          created_at: string | null;
          id: string;
          run_date: string | null;
          site_id: string;
          status: Database["public"]["Enums"]["payroll_status"] | null;
          total_employees: number | null;
          total_net_amount: number | null;
          updated_at: string | null;
        };
        Insert: {
          commission?: number | null;
          created_at?: string | null;
          id?: string;
          run_date?: string | null;
          site_id?: string;
          status?: Database["public"]["Enums"]["payroll_status"] | null;
          total_employees?: number | null;
          total_net_amount?: number | null;
          updated_at?: string | null;
        };
        Update: {
          commission?: number | null;
          created_at?: string | null;
          id?: string;
          run_date?: string | null;
          site_id?: string;
          status?: Database["public"]["Enums"]["payroll_status"] | null;
          total_employees?: number | null;
          total_net_amount?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "project_sites";
            referencedColumns: ["id"];
          },
        ];
      };
      payroll_entries: {
        Row: {
          amount: number | null;
          created_at: string | null;
          employee_id: string | null;
          id: string;
          payment_status: Database["public"]["Enums"]["payroll_status"] | null;
          payment_template_components_id: string | null;
          payroll_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          amount?: number | null;
          created_at?: string | null;
          employee_id?: string | null;
          id?: string;
          payment_status?: Database["public"]["Enums"]["payroll_status"] | null;
          payment_template_components_id?: string | null;
          payroll_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string | null;
          employee_id?: string | null;
          id?: string;
          payment_status?: Database["public"]["Enums"]["payroll_status"] | null;
          payment_template_components_id?: string | null;
          payroll_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_entries_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payroll_entries_payment_template_components_id_fkey";
            columns: ["payment_template_components_id"];
            isOneToOne: false;
            referencedRelation: "payment_template_components";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payroll_entries_payroll_id_fkey";
            columns: ["payroll_id"];
            isOneToOne: false;
            referencedRelation: "payroll";
            referencedColumns: ["id"];
          },
        ];
      };
      professional_tax: {
        Row: {
          company_id: string;
          created_at: string | null;
          deduction_cycle: string;
          gross_salary_range: Json | null;
          id: string;
          pt_number: string;
          state: string;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          deduction_cycle?: string;
          gross_salary_range?: Json | null;
          id?: string;
          pt_number: string;
          state: string;
          updated_at?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          deduction_cycle?: string;
          gross_salary_range?: Json | null;
          id?: string;
          pt_number?: string;
          state?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "professional_tax_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      project_sites: {
        Row: {
          address_line_1: string;
          address_line_2: string | null;
          capacity: number | null;
          city: string;
          company_location_id: string | null;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          latitude: number | null;
          longitude: number | null;
          name: string;
          pincode: string;
          project_id: string;
          site_code: string;
          state: string;
          updated_at: string | null;
        };
        Insert: {
          address_line_1: string;
          address_line_2?: string | null;
          capacity?: number | null;
          city: string;
          company_location_id?: string | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          pincode: string;
          project_id: string;
          site_code: string;
          state: string;
          updated_at?: string | null;
        };
        Update: {
          address_line_1?: string;
          address_line_2?: string | null;
          capacity?: number | null;
          city?: string;
          company_location_id?: string | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          pincode?: string;
          project_id?: string;
          site_code?: string;
          state?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_sites_company_address_id_fkey";
            columns: ["company_location_id"];
            isOneToOne: false;
            referencedRelation: "company_locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_sites_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          actual_end_date: string | null;
          created_at: string | null;
          description: string | null;
          end_client_id: string | null;
          environmental_considerations: string | null;
          estimated_end_date: string | null;
          health_safety_requirements: string | null;
          id: string;
          name: string;
          primary_contractor_id: string | null;
          project_client_id: string;
          project_code: string;
          project_type: string | null;
          quality_standards: string | null;
          risk_assessment: string | null;
          start_date: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          actual_end_date?: string | null;
          created_at?: string | null;
          description?: string | null;
          end_client_id?: string | null;
          environmental_considerations?: string | null;
          estimated_end_date?: string | null;
          health_safety_requirements?: string | null;
          id?: string;
          name: string;
          primary_contractor_id?: string | null;
          project_client_id: string;
          project_code: string;
          project_type?: string | null;
          quality_standards?: string | null;
          risk_assessment?: string | null;
          start_date: string;
          status: string;
          updated_at?: string | null;
        };
        Update: {
          actual_end_date?: string | null;
          created_at?: string | null;
          description?: string | null;
          end_client_id?: string | null;
          environmental_considerations?: string | null;
          estimated_end_date?: string | null;
          health_safety_requirements?: string | null;
          id?: string;
          name?: string;
          primary_contractor_id?: string | null;
          project_client_id?: string;
          project_code?: string;
          project_type?: string | null;
          quality_standards?: string | null;
          risk_assessment?: string | null;
          start_date?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_end_client_id_fkey";
            columns: ["end_client_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_primary_contractor_id_fkey";
            columns: ["primary_contractor_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_project_client_id_fkey";
            columns: ["project_client_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      reimbursements: {
        Row: {
          amount: number | null;
          company_id: string;
          created_at: string | null;
          employee_id: string;
          id: string;
          is_deductible: boolean | null;
          status: string | null;
          submitted_date: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          amount?: number | null;
          company_id: string;
          created_at?: string | null;
          employee_id: string;
          id?: string;
          is_deductible?: boolean | null;
          status?: string | null;
          submitted_date?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          amount?: number | null;
          company_id?: string;
          created_at?: string | null;
          employee_id?: string;
          id?: string;
          is_deductible?: boolean | null;
          status?: string | null;
          submitted_date?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reimbursements_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reimbursements_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reimbursements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      site_pay_sequence: {
        Row: {
          created_at: string;
          id: string;
          pay_day: number;
          pay_frequency: string;
          site_id: string;
          working_days: number[];
        };
        Insert: {
          created_at?: string;
          id?: string;
          pay_day?: number;
          pay_frequency?: string;
          site_id: string;
          working_days?: number[];
        };
        Update: {
          created_at?: string;
          id?: string;
          pay_day?: number;
          pay_frequency?: string;
          site_id?: string;
          working_days?: number[];
        };
        Relationships: [
          {
            foreignKeyName: "pay_sequence_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: true;
            referencedRelation: "project_sites";
            referencedColumns: ["id"];
          },
        ];
      };
      statutory_bonus: {
        Row: {
          company_id: string;
          created_at: string | null;
          id: string;
          is_default: boolean | null;
          payment_frequency: string;
          payout_month: number | null;
          percentage: number;
          updated_at: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          payment_frequency?: string;
          payout_month?: number | null;
          percentage?: number;
          updated_at?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          payment_frequency?: string;
          payout_month?: number | null;
          percentage?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "statutory_bonus_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          avatar: string | null;
          company_id: string | null;
          created_at: string | null;
          email: string | null;
          first_name: string;
          id: string;
          is_active: boolean | null;
          is_email_verified: boolean | null;
          is_mobile_verified: boolean | null;
          last_login: string | null;
          last_name: string;
          mobile_number: string | null;
          preferred_language: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar?: string | null;
          company_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          is_active?: boolean | null;
          is_email_verified?: boolean | null;
          is_mobile_verified?: boolean | null;
          last_login?: string | null;
          last_name: string;
          mobile_number?: string | null;
          preferred_language?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar?: string | null;
          company_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          is_active?: boolean | null;
          is_email_verified?: boolean | null;
          is_mobile_verified?: boolean | null;
          last_login?: string | null;
          last_name?: string;
          mobile_number?: string | null;
          preferred_language?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      assignment_target_type:
        | "payment_field"
        | "epf"
        | "esic"
        | "bonus"
        | "pt"
        | "lwf";
      calculation_type: "fixed" | "percentage_of_basic";
      eligibility_option_type: "position" | "skill_level";
      feedback_category: "suggestion" | "bug" | "complain";
      feedback_severity: "low" | "normal" | "urgent";
      payment_type: "fixed" | "variable";
      payroll_status: "pending" | "approved" | "created";
      template_assignment_type: "employee" | "site";
      template_calculation_type: "variable" | "percentage_of_ctc";
      template_component_type:
        | "earning"
        | "deduction"
        | "statutory_contribution"
        | "bonus"
        | "other";
      working_shift: "day" | "afternoon" | "night";
    };
    CompositeTypes: {
      salary_range_object: {
        start_range: number | null;
        end_range: number | null;
        tax_amount: number | null;
      };
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

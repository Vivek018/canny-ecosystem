export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          company_size: string
          company_type: string
          created_at: string | null
          email_suffix: string | null
          id: string
          is_active: boolean | null
          logo: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          company_size?: string
          company_type?: string
          created_at?: string | null
          email_suffix?: string | null
          id?: string
          is_active?: boolean | null
          logo?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          company_size?: string
          company_type?: string
          created_at?: string | null
          email_suffix?: string | null
          id?: string
          is_active?: boolean | null
          logo?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_locations: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          company_id: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          pincode: string
          state: string
          updated_at: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          pincode: string
          state: string
          updated_at?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          pincode?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_registration_details: {
        Row: {
          company_id: string
          created_at: string | null
          esi_number: string | null
          gst_number: string | null
          lwf_number: string | null
          pan_number: string | null
          pf_number: string | null
          pt_number: string | null
          registration_number: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          esi_number?: string | null
          gst_number?: string | null
          lwf_number?: string | null
          pan_number?: string | null
          pf_number?: string | null
          pt_number?: string | null
          registration_number?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          esi_number?: string | null
          gst_number?: string | null
          lwf_number?: string | null
          pan_number?: string | null
          pf_number?: string | null
          pt_number?: string | null
          registration_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_registration_details_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_relationships: {
        Row: {
          child_company_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          parent_company_id: string
          relationship_type: string | null
          start_date: string
          terms: Json | null
          updated_at: string | null
        }
        Insert: {
          child_company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          parent_company_id: string
          relationship_type?: string | null
          start_date?: string
          terms?: Json | null
          updated_at?: string | null
        }
        Update: {
          child_company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          parent_company_id?: string
          relationship_type?: string | null
          start_date?: string
          terms?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_relationships_child_company_id_fkey"
            columns: ["child_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_relationships_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string | null
          city: string
          country: string | null
          created_at: string | null
          employee_id: string
          id: string
          is_primary: boolean | null
          pincode: string
          state: string
          updated_at: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          is_primary?: boolean | null
          pincode: string
          state: string
          updated_at?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          is_primary?: boolean | null
          pincode?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_addresses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_bank_details: {
        Row: {
          account_holder_name: string
          account_number: string
          bank_name: string
          branch_name: string | null
          created_at: string | null
          employee_id: string
          ifsc_code: string
          updated_at: string | null
        }
        Insert: {
          account_holder_name: string
          account_number: string
          bank_name: string
          branch_name?: string | null
          created_at?: string | null
          employee_id: string
          ifsc_code: string
          updated_at?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          bank_name?: string
          branch_name?: string | null
          created_at?: string | null
          employee_id?: string
          ifsc_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_bank_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_guardians: {
        Row: {
          address_same_as_employee: boolean | null
          alternate_mobile_number: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          employee_id: string
          first_name: string
          gender: string | null
          id: string
          is_emergency_contact: boolean | null
          last_name: string
          middle_name: string | null
          mobile_number: string | null
          occupation: string | null
          relationship: string
          updated_at: string | null
        }
        Insert: {
          address_same_as_employee?: boolean | null
          alternate_mobile_number?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          employee_id: string
          first_name: string
          gender?: string | null
          id?: string
          is_emergency_contact?: boolean | null
          last_name: string
          middle_name?: string | null
          mobile_number?: string | null
          occupation?: string | null
          relationship: string
          updated_at?: string | null
        }
        Update: {
          address_same_as_employee?: boolean | null
          alternate_mobile_number?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          employee_id?: string
          first_name?: string
          gender?: string | null
          id?: string
          is_emergency_contact?: boolean | null
          last_name?: string
          middle_name?: string | null
          mobile_number?: string | null
          occupation?: string | null
          relationship?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_guardians_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_project_assignments: {
        Row: {
          assignment_type: string | null
          billable_rate: number | null
          created_at: string | null
          employee_id: string
          end_date: string | null
          id: string
          is_current: boolean | null
          position: string
          project_site_id: string
          start_date: string
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_type?: string | null
          billable_rate?: number | null
          created_at?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          position: string
          project_site_id: string
          start_date: string
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_type?: string | null
          billable_rate?: number | null
          created_at?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          position?: string
          project_site_id?: string
          start_date?: string
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_project_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_project_assignments_project_site_id_fkey"
            columns: ["project_site_id"]
            isOneToOne: false
            referencedRelation: "project_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_project_assignments_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_skills: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          is_primary: boolean | null
          skill_level: string | null
          skill_name: string
          updated_at: string | null
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          is_primary?: boolean | null
          skill_level?: string | null
          skill_name: string
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          is_primary?: boolean | null
          skill_level?: string | null
          skill_name?: string
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_statutory_details: {
        Row: {
          aadhaar_number: string | null
          created_at: string | null
          driving_license_expiry: string | null
          driving_license_number: string | null
          employee_id: string
          esic_number: string | null
          id: string
          pan_number: string | null
          passport_expiry: string | null
          passport_number: string | null
          pf_number: string | null
          uan_number: string | null
          updated_at: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          created_at?: string | null
          driving_license_expiry?: string | null
          driving_license_number?: string | null
          employee_id: string
          esic_number?: string | null
          id?: string
          pan_number?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          pf_number?: string | null
          uan_number?: string | null
          updated_at?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          created_at?: string | null
          driving_license_expiry?: string | null
          driving_license_number?: string | null
          employee_id?: string
          esic_number?: string | null
          id?: string
          pan_number?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          pf_number?: string | null
          uan_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_statutory_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_work_history: {
        Row: {
          company_name: string
          created_at: string | null
          employee_id: string
          end_date: string | null
          id: string
          position: string
          responsibilities: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          position: string
          responsibilities?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          position?: string
          responsibilities?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_work_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string | null
          date_of_birth: string
          education: string | null
          employee_code: string
          first_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          last_name: string
          marital_status: string | null
          middle_name: string | null
          nationality: string | null
          personal_email: string | null
          primary_mobile_number: string
          secondary_mobile_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth: string
          education?: string | null
          employee_code: string
          first_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name: string
          marital_status?: string | null
          middle_name?: string | null
          nationality?: string | null
          personal_email?: string | null
          primary_mobile_number: string
          secondary_mobile_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string
          education?: string | null
          employee_code?: string
          first_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          marital_status?: string | null
          middle_name?: string | null
          nationality?: string | null
          personal_email?: string | null
          primary_mobile_number?: string
          secondary_mobile_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_sites: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          capacity: number | null
          city: string
          company_location_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          pincode: string
          project_id: string
          site_code: string
          state: string
          updated_at: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          capacity?: number | null
          city: string
          company_location_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          pincode: string
          project_id: string
          site_code: string
          state: string
          updated_at?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          capacity?: number | null
          city?: string
          company_location_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          pincode?: string
          project_id?: string
          site_code?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_site_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_sites_company_address_id_fkey"
            columns: ["company_location_id"]
            isOneToOne: false
            referencedRelation: "company_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_end_date: string | null
          created_at: string | null
          description: string | null
          end_client_id: string | null
          environmental_considerations: string | null
          estimated_end_date: string | null
          health_safety_requirements: string | null
          id: string
          name: string
          primary_contractor_id: string | null
          project_client_id: string
          project_code: string
          project_type: string | null
          quality_standards: string | null
          risk_assessment: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          actual_end_date?: string | null
          created_at?: string | null
          description?: string | null
          end_client_id?: string | null
          environmental_considerations?: string | null
          estimated_end_date?: string | null
          health_safety_requirements?: string | null
          id?: string
          name: string
          primary_contractor_id?: string | null
          project_client_id: string
          project_code: string
          project_type?: string | null
          quality_standards?: string | null
          risk_assessment?: string | null
          start_date: string
          status: string
          updated_at?: string | null
        }
        Update: {
          actual_end_date?: string | null
          created_at?: string | null
          description?: string | null
          end_client_id?: string | null
          environmental_considerations?: string | null
          estimated_end_date?: string | null
          health_safety_requirements?: string | null
          id?: string
          name?: string
          primary_contractor_id?: string | null
          project_client_id?: string
          project_code?: string
          project_type?: string | null
          quality_standards?: string | null
          risk_assessment?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_end_client_id_fkey"
            columns: ["end_client_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_primary_contractor_id_fkey"
            columns: ["primary_contractor_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_client_id_fkey"
            columns: ["project_client_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      site_pay_sequence: {
        Row: {
          created_at: string
          id: string
          pay_day: number
          pay_frequency: string
          site_id: string
          working_days: number[]
        }
        Insert: {
          created_at?: string
          id?: string
          pay_day?: number
          pay_frequency?: string
          site_id: string
          working_days?: number[]
        }
        Update: {
          created_at?: string
          id?: string
          pay_day?: number
          pay_frequency?: string
          site_id?: string
          working_days?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "pay_sequence_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "project_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          company_id: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          is_email_verified: boolean | null
          is_mobile_verified: boolean | null
          last_login: string | null
          last_name: string
          mobile_number: string | null
          preferred_language: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          is_email_verified?: boolean | null
          is_mobile_verified?: boolean | null
          last_login?: string | null
          last_name: string
          mobile_number?: string | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          is_email_verified?: boolean | null
          is_mobile_verified?: boolean | null
          last_login?: string | null
          last_name?: string
          mobile_number?: string | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

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
    : never

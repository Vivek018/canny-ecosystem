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
      company: {
        Row: {
          created_at: string
          email_suffix: string | null
          id: string
          logo: string | null
          name: string
          reimbursement_charge: number | null
          service_charge: number
        }
        Insert: {
          created_at?: string
          email_suffix?: string | null
          id?: string
          logo?: string | null
          name: string
          reimbursement_charge?: number | null
          service_charge?: number
        }
        Update: {
          created_at?: string
          email_suffix?: string | null
          id?: string
          logo?: string | null
          name?: string
          reimbursement_charge?: number | null
          service_charge?: number
        }
        Relationships: []
      }
      location: {
        Row: {
          address: string
          city: string
          company_id: string | null
          created_at: string
          esic_code: string
          id: string
          is_main: boolean | null
          name: string
          pin_code: string
          state: string
        }
        Insert: {
          address: string
          city: string
          company_id?: string | null
          created_at?: string
          esic_code: string
          id?: string
          is_main?: boolean | null
          name: string
          pin_code: string
          state: string
        }
        Update: {
          address?: string
          city?: string
          company_id?: string | null
          created_at?: string
          esic_code?: string
          id?: string
          is_main?: boolean | null
          name?: string
          pin_code?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      pay_sequence: {
        Row: {
          created_at: string
          id: string
          pay_day: number
          pay_frequency: string
          project_id: string
          working_days: number[]
        }
        Insert: {
          created_at?: string
          id?: string
          pay_day?: number
          pay_frequency?: string
          project_id: string
          working_days?: number[]
        }
        Update: {
          created_at?: string
          id?: string
          pay_day?: number
          pay_frequency?: string
          project_id?: string
          working_days?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "pay_sequence_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      project: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          ending_date: string | null
          id: string
          image: string | null
          name: string
          starting_date: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          ending_date?: string | null
          id?: string
          image?: string | null
          name: string
          starting_date: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          ending_date?: string | null
          id?: string
          image?: string | null
          name?: string
          starting_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_checked_in: string
          last_name: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string
          first_name: string
          id?: string
          last_checked_in: string
          last_name?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_checked_in?: string
          last_name?: string | null
        }
        Relationships: []
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

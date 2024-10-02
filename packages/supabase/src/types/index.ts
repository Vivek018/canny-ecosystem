import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db";

export * from "./db";

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

export type CompanyDatabaseInsert =
  Database["public"]["Tables"]["companies"]["Insert"];

export type CompanyDatabaseUpdate =
  Database["public"]["Tables"]["companies"]["Update"];

// Company Registration Details
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

// Pay Sequences
export type SitePaySequenceDatabaseRow =
  Database["public"]["Tables"]["site_pay_sequence"]["Row"];

export type SitePaySequenceDatabaseUpdate =
  Database["public"]["Tables"]["site_pay_sequence"]["Update"];

// Locations
export type ProjectSitesDatabaseRow =
  Database["public"]["Tables"]["project_sites"]["Row"];

export type ProjectSitesDatabaseInsert =
  Database["public"]["Tables"]["project_sites"]["Insert"];

export type ProjectSitesDatabaseUpdate =
  Database["public"]["Tables"]["project_sites"]["Update"];

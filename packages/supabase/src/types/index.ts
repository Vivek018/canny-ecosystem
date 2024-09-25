import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db";

export * from "./db";

export type TypedSupabaseClient = SupabaseClient<Database>;

export type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};


// Users
export type UserDatabaseRow = Database["public"]["Tables"]["user"]["Row"];

export type UserDatabaseInsert = Database["public"]["Tables"]["user"]["Insert"];


// Companies
export type CompaniesDatabaseRow = {
  id: Database["public"]["Tables"]["company"]["Row"]["id"];
  name: Database["public"]["Tables"]["company"]["Row"]["name"];
}[];

export type CompanyDatabaseInsert =
  Database["public"]["Tables"]["company"]["Insert"];

export type CompanyDatabaseUpdate =
  Database["public"]["Tables"]["company"]["Update"];

// Projects
export type ProjectDatabaseRow = Database["public"]["Tables"]["project"]["Row"];

export type ProjectDatabaseInsert =
  Database["public"]["Tables"]["project"]["Insert"];

export type ProjectDatabaseUpdate =
  Database["public"]["Tables"]["project"]["Update"];

// Pay Sequences
export type PaySequenceDatabaseRow =
  Database["public"]["Tables"]["pay_sequence"]["Row"];

export type PaySequenceDatabaseUpdate =
  Database["public"]["Tables"]["pay_sequence"]["Update"];


// Locations
export type LocationDatabaseRow =
  Database["public"]["Tables"]["location"]["Row"];

export type LocationDatabaseInsert =
  Database["public"]["Tables"]["location"]["Insert"];

export type LocationDatabaseUpdate =
  Database["public"]["Tables"]["location"]["Update"];

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db";

export * from "./db";

export type TypedSupabaseClient = SupabaseClient<Database>;

export type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

export type UserDatabaseRow = Database["public"]["Tables"]["user"]["Row"];

export type UserDatabaseInsert = Database["public"]["Tables"]["user"]["Insert"];

export type CompaniesDatabaseRow = {
  id: Database["public"]["Tables"]["company"]["Row"]["id"];
  name: Database["public"]["Tables"]["company"]["Row"]["name"];
}[];

export type CompanyDatabaseInsert =
  Database["public"]["Tables"]["company"]["Insert"];

export type CompanyDatabaseUpdate =
  Database["public"]["Tables"]["company"]["Update"];

export type LocationDatabaseRow =
  Database["public"]["Tables"]["location"]["Row"];

export type LocationDatabaseInsert =
  Database["public"]["Tables"]["location"]["Insert"];

export type LocationDatabaseUpdate =
  Database["public"]["Tables"]["location"]["Update"];

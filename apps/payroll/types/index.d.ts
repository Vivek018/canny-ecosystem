import type { Database } from "@canny_ecosystem/supabase/types";

export type UserDatabaseRow = Database["public"]["Tables"]["user"]["Row"];

export type CompaniesDatabaseRow = {
  id: Database["public"]["Tables"]["company"]["Row"]["id"];
  name: Database["public"]["Tables"]["company"]["Row"]["name"];
}[];
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db";

export * from "./db";

export type TypedSupabaseClient = SupabaseClient<Database>;

export type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};
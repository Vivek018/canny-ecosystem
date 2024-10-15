import { createBrowserClient } from "@supabase/ssr";
import type { Database, SupabaseEnv, TypedSupabaseClient } from "../types";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export type SupabaseOutletContext = {
  supabase: TypedSupabaseClient;
};

type useSupabase = {
  env: SupabaseEnv;
  session?: Session | null;
};

export const useSupabase = ({ env, session }: useSupabase) => {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY),
  );

  useEffect(() => {
    if (session) {
      supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }
  }, [session]);

  return { supabase };
};

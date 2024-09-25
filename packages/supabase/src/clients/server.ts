import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import type { Database, SupabaseEnv } from "../types";

export const getSupabaseEnv = (): SupabaseEnv => ({
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
});

export function getSupabaseWithHeaders({ request }: { request: Request }) {
  const headers = new Headers();

  const supabase = createServerClient<Database>(
    getSupabaseEnv().SUPABASE_URL,
    getSupabaseEnv().SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet: any) {
          for (const { name, value, options } of cookiesToSet) {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            );
          }
        },
      },
    },
  );

  return { supabase, headers };
}

export async function getSupabaseWithSessionAndHeaders({
  request,
}: { request: Request }) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { supabase, headers, session };
}

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
  const cookieHeader = request.headers.get("Cookie");

  const supabase = createServerClient<Database>(
    getSupabaseEnv().SUPABASE_URL,
    getSupabaseEnv().SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookies = parseCookieHeader(cookieHeader ?? "");
          return cookies;
        },
        setAll(cookiesToSet) {
          try {
            for (const cookie of cookiesToSet) {
              const { name, value, options } = cookie;

              // Check if we need to split the cookie
              if (value && value.length > 4000) {
                // Split into chunks and set multiple cookies
                const chunks = [];
                let i = 0;
                while (i < value.length) {
                  chunks.push(value.slice(i, i + 4000));
                  i += 4000;
                }
                for (const [index, chunk] of chunks.entries()) {
                  const chunkName = `${name}.${index}`;
                  const cookieStr = serializeCookieHeader(chunkName, chunk, {
                    ...options,
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 34560000, // 400 days
                  });
                  headers.append("Set-Cookie", cookieStr);
                }
              } else {
                // Set as single cookie
                const cookieStr = serializeCookieHeader(name, value, {
                  ...options,
                  path: "/",
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "lax",
                  maxAge: 34560000,
                });
                headers.append("Set-Cookie", cookieStr);
              }
            }
          } catch (error) {
            console.error("Error setting cookies:", error);
            throw error;
          }
        },
      },
    },
  );

  return { supabase, headers };
}

export async function getSupabaseWithSessionAndHeaders({
  request,
}: {
  request: Request;
}) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Session error:", error);
    }

    return { supabase, headers, session };
  } catch (error) {
    console.error("Error getting session:", error);
    throw error;
  }
}

import { safeRedirect } from "@/utils/server/http.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { type LoaderFunctionArgs, json } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const headers = new Headers();

  console.log(code);
  console.log(next);

  if (code) {
    const { supabase, headers: supabaseHeaders } = getSupabaseWithHeaders({
      request,
    });
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log(data, error);

      if (error) {
        console.error(
          "Auth Callback - Error exchanging code for session:",
          error
        );
        return json({ error: error.message }, { status: 500 });
      }

      if (data.session) {
        headers.append("Set-Cookie", supabaseHeaders.get("Set-Cookie") || "");
        return safeRedirect(next, { headers });
      }
    } catch (error) {
      console.error("Auth Callback - Unexpected error:", error);
      return json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  } else {
    console.error("Auth Callback - No code provided in URL");
  }

  // If we reach here, something went wrong
  return safeRedirect("/login?error=auth_callback_failed", { headers });
}

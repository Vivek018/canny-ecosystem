import type { LoaderFunctionArgs } from "@remix-run/node";
import { safeRedirect } from "@/utils/server/http.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { updateUserLastLoginAndSetAvatar } from "@canny_ecosystem/supabase/mutations";
import { DEFAULT_ROUTE } from "@/constant";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? DEFAULT_ROUTE;

  if (!code) {
    console.error("No code provided");
    return safeRedirect("/login?error=no_code");
  }

  try {
    const { supabase, headers } = getSupabaseWithHeaders({ request });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) throw error;

    if (!data.session) {
      throw new Error("No session in response");
    }

    await updateUserLastLoginAndSetAvatar({ supabase });

    return safeRedirect(next, {
      headers: headers,
    });
  } catch (error: any) {
    console.error("Auth callback error:", error);
    return safeRedirect(`/login?error=${encodeURIComponent(error?.message)}`);
  }
}

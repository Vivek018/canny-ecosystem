import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { updateUserLastLogin } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";

export async function loader ({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const { user } = await getSessionUser({ request });

  if (user) {
    return safeRedirect(DEFAULT_ROUTE, { status: 303 });
  }

  return json({ error });
};

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({
    request,
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Login - OAuth error:", error);
    return json({ error: error.message }, { status: 500 });
  }

  if (data.url) {
    await updateUserLastLogin({ supabase });
    return redirect(data.url, { headers });
  }

  return json({ error: "Failed to get login URL" }, { status: 500 });
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();

  const error = actionData?.error || loaderData.error;

  return (
    <section className="flex min-h-screen justify-center items-center overflow-hidden p-6 -mt-20 md:p-0">
      <div className="relative z-20 m-auto flex w-full max-w-[420px] flex-col py-8">
        <div className="flex w-full flex-col justify-center relative">
          <div className="pb-4 bg-gradient-to-r from-primary dark:via-primary dark:to-[#848484] to-[#000] inline-block text-transparent bg-clip-text mx-auto">
            <h1 className="font-extrabold uppercase pb-1 tracking-widest text-4xl">
              CANNY ECOSYSTEM
            </h1>
          </div>

          <p className="font-medium text-center pb-2 text-[#878787]">
            Managing your workforce effortlessly, from fully transparent
            operations to most detailed insights, all in one end to end
            ecosystem.
          </p>

          <div className="pointer-events-auto my-6 flex flex-col">
            <Form method="POST">
              <Button type="submit" variant="default" className="w-full">
                Continue with Google
              </Button>
            </Form>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <p className="text-xs text-[#878787]">
            By clicking continue, you acknowledge that you have read and agree
            to Canny's{" "}
            <Link to="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/policy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

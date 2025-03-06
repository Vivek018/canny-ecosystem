import { ThemeSwitch } from "@/components/theme-switch";
import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { useTheme } from "@/utils/theme";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { getUserByEmail } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Logo } from "@canny_ecosystem/ui/logo";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user: sessionUser } = await getSessionUser({ request });

  const { supabase } = getSupabaseWithHeaders({ request });

  if (sessionUser?.email) {
    const { data: userData, error: userError } = await getUserByEmail({
      supabase,
      email: sessionUser.email,
    });

    if (userData && !userError) {
      return safeRedirect(DEFAULT_ROUTE);
    }
  }

  return json({});
};

export default function NoUserFound() {
  const { theme } = useTheme();

  return (
    <div className="w-full h-full">
      <header className="flex justify-between items-center mx-5 mt-4 md:mx-10 md:mt-10">
        <div>
          <Link to={DEFAULT_ROUTE}>
            <Logo />
          </Link>
        </div>
        <div>
          <ThemeSwitch theme={theme ?? "system"} />
        </div>
      </header>
      <section className="flex min-h-screen max-h-screen justify-center items-center overflow-hidden p-6 -mt-20 md:p-0">
        <div className="relative z-20 m-auto flex w-full max-w-[450px] flex-col py-8">
          <div className="flex w-full flex-col justify-center relative">
            <div className="pb-4 bg-gradient-to-r from-primary dark:via-primary dark:to-[#848484] to-[#000] inline-block text-transparent bg-clip-text mx-auto">
              <h1 className="font-extrabold uppercase pb-1 tracking-widest text-4xl">
                CANNY ECOSYSTEM
              </h1>
            </div>

            <p className="font-medium text-center pb-2 text-[#878787]">
              You do not have access to this website. If you are a client of us,
              please contact us for assistance. If you arrived here by mistake,
              please log out. Thank you!
            </p>

            <div className="pointer-events-auto mt-6 flex flex-col mb-6">
              <Form method="POST" action="/logout">
                <Button type="submit" variant="destructive" className="w-full">
                  Logout
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

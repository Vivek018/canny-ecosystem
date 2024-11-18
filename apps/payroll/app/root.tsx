import {
  json,
  type LoaderFunctionArgs,
  type LinksFunction,
  type HeadersFunction,
} from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";

import tailwindStyleSheetUrl from "@/styles/tailwind.css?url";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { getTheme } from "./utils/server/theme.server";
import { useTheme } from "./utils/theme";
import { href as iconsHref } from "@canny_ecosystem/ui/icon";
import { ClientHintCheck, getHints } from "./utils/client-hints";
import { useNonce } from "./utils/providers/nonce-provider";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Logo } from "@canny_ecosystem/ui/logo";
import { ThemeSwitch } from "./components/theme-switch";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import {
  getCompanies,
  getUserByEmail,
} from "@canny_ecosystem/supabase/queries";
import {
  getCompanyIdOrFirstCompany,
  setCompanyId,
} from "./utils/server/company.server";
import { safeRedirect } from "./utils/server/http.server";
import { useEffect } from "react";
import { DEFAULT_ROUTE } from "./constant";

export const links: LinksFunction = () => {
  return [
    { rel: "preload", href: iconsHref, as: "image" },
    { rel: "stylesheet", href: tailwindStyleSheetUrl },
  ].filter(Boolean);
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    "Server-Timing": loaderHeaders.get("Server-Timing") ?? "",
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user: sessionUser } = await getSessionUser({ request });
  const { supabase } = getSupabaseWithHeaders({ request });
  let user = null;
  let companies = null;

  if (sessionUser?.email) {
    const { data: userData, error: userError } = await getUserByEmail({
      supabase,
      email: sessionUser.email,
    });
    const { data: companiesData, error: companiesError } = await getCompanies({
      supabase,
    });

    if (userError || !userData) {
      console.error("userError", userError);
    } else {
      user = userData;
    }

    if (companiesError) {
      console.error("companiesError", companiesError);

      companies = null;
    } else {
      companies = companiesData;
    }
  } else {
    safeRedirect("/login");
  }

  const { companyId, setCookie } = await getCompanyIdOrFirstCompany(
    request,
    supabase
  );

  if (setCookie) {
    const headers = new Headers();
    headers.append("Set-Cookie", setCompanyId(companyId));
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  return json({
    isLoggedIn: !!sessionUser,
    user,
    companies,
    requestInfo: {
      hints: getHints(request),
      path: new URL(request.url).pathname,
      userPrefs: {
        theme: getTheme(request),
        companyId: companyId,
      },
    },
  });
}

function Document({
  children,
  nonce,
  theme,
}: {
  children: React.ReactNode;
  nonce: string;
  theme?: string;
}) {
  return (
    <html lang='en' className={`${theme} h-full overflow-x-hidden`}>
      <head>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Links />
      </head>
      <body className='h-full w-full bg-background text-foreground'>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function App() {
  const {
    isLoggedIn,
    user,
    companies,
    requestInfo: {
      userPrefs: { theme: initialTheme },
    },
  } = useLoaderData<typeof loader>();

  const nonce = useNonce();
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && !user) {
      navigate("/no-user-found");
    }
  }, []);

  return (
    <Document nonce={nonce} theme={theme}>
      <main className='flex h-full w-full bg-background text-foreground '>
        {!user ? (
          <div className='w-full h-full'>
            <header className='flex justify-between items-center mx-5 mt-4 md:mx-10 md:mt-10'>
              <div>
                <Link to={"/"}>
                  <Logo />
                </Link>
              </div>
              <div>
                <ThemeSwitch theme={initialTheme || "system"} />
              </div>
            </header>
            <Outlet />
          </div>
        ) : (
          <>
            <Sidebar
              className='flex-none'
              theme={initialTheme || "system"}
              user={user ?? []}
            />
            <div className='flex max-h-screen flex-grow flex-col overflow-scroll ml-20'>
              <Header className='px-5' companies={companies ?? []} />
              <div className='px-5'>
                <Outlet />
              </div>
            </div>
          </>
        )}
      </main>
    </Document>
  );
}

function AppWithProviders() {
  return <App />;
}

export default AppWithProviders;

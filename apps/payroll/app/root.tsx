import {
  json,
  type LoaderFunctionArgs,
  type LinksFunction,
  type HeadersFunction,
  redirect,
} from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";

import tailwindStyleSheetUrl from "@/styles/tailwind.css?url";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { getTheme } from "./utils/server/theme.server";
import { useTheme } from "./utils/theme";
// import { href as iconsHref } from './components/ui/icon'
import { ClientHintCheck, getHints } from "./utils/client-hints";
import { useNonce } from "./utils/providers/nonce-provider";
import {
  getSupabaseEnv,
  getSupabaseWithHeaders,
  getSupabaseWithSessionAndHeaders,
} from "@canny_ecosystem/supabase/server";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { Logo } from "@canny_ecosystem/ui/logo";
import { ThemeSwitch } from "./components/theme-switch";
// import { getDomainUrl } from './utils/misx'
// import { useNonce } from './utils/providers/nonce-provider'

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStyleSheetUrl }].filter(Boolean);
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return json({
    user,
    requestInfo: {
      hints: getHints(request),

      // origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
      userPrefs: {
        theme: getTheme(request),
      },
    },
  });
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    "Server-Timing": loaderHeaders.get("Server-Timing") ?? "",
  };
};

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
    <html lang="en" className={`${theme} h-full overflow-x-hidden`}>
      <head>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Links />
      </head>
      <body className="h-full w-full bg-background text-foreground">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function App() {
  const {
    user,
    requestInfo: {
      userPrefs: { theme: initialTheme },
    },
  } = useLoaderData<typeof loader>();

  const nonce = useNonce();
  const theme = useTheme();

  return (
    <Document nonce={nonce} theme={theme}>
      <main className="flex h-full w-full bg-background text-foreground ">
        {!user ? (
          <div className="w-full h-full">
            <header className="flex justify-between items-center mx-5 mt-4 md:mx-10 md:mt-10">
              <div>
                <Link to="/">
                  <Logo />
                </Link>
              </div>
              <div>
                <ThemeSwitch />
              </div>
            </header>
            <Outlet />
          </div>
        ) : (
          <>
            <Sidebar className="flex-none" />
            <div className="flex max-h-screen flex-grow flex-col overflow-scroll px-4">
              <Header theme={initialTheme || "system"} />
              <Outlet />
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

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
} from "@remix-run/react";

import tailwindStyleSheetUrl from "@/styles/tailwind.css?url";
import { getTheme } from "./utils/server/theme.server";
import { useTheme } from "./utils/theme";
import { href as iconsHref } from "@canny_ecosystem/ui/icon";
import { ClientHintCheck, getHints } from "./utils/client-hints";
import { useNonce } from "./utils/providers/nonce-provider";
import { Logo } from "@canny_ecosystem/ui/logo";
import { ThemeSwitch } from "./components/theme-switch";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { safeRedirect } from "./utils/server/http.server";
import {
  getCompanyIdOrFirstCompany,
  setCompanyId,
} from "./utils/server/company.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
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

  const { companyId, setCookie } = await getCompanyIdOrFirstCompany(
    request,
    supabase,
  );

  if (setCookie) {
    const headers = new Headers();
    headers.append("Set-Cookie", setCompanyId(companyId));
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  return json({
    sessionUser,
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
    sessionUser,
    requestInfo: {
      userPrefs: { theme: initialTheme },
    },
  } = useLoaderData<typeof loader>();

  const nonce = useNonce();
  const theme = useTheme();

  return (
    <Document nonce={nonce} theme={theme}>
      <main className="flex h-full w-full bg-background text-foreground ">
        {!sessionUser ? (
          <div className="w-full h-full">
            <header className="flex justify-between items-center mx-5 mt-4 md:mx-10 md:mt-10">
              <div>
                <Link to={DEFAULT_ROUTE}>
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
          <Outlet />
        )}
      </main>
    </Document>
  );
}

export default function AppWithProviders() {
  return <App />;
}

import {
  json,
  type LoaderFunctionArgs,
  type LinksFunction,
  type HeadersFunction,
} from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { clearAllCache, clientCaching } from "./utils/cache";
import tailwindStyleSheetUrl from "@/styles/tailwind.css?url";
import { getTheme } from "./utils/server/theme.server";
import { useTheme } from "./utils/theme";
import { href as iconsHref } from "@canny_ecosystem/ui/icon";
import { ClientHintCheck, getHints } from "./utils/client-hints";
import { useNonce } from "./utils/providers/nonce-provider";
import { Logo } from "@canny_ecosystem/ui/logo";
import { ThemeSwitch } from "./components/theme-switch";
import { safeRedirect } from "./utils/server/http.server";
import {
  getCompanyIdOrFirstCompany,
  setCompanyId,
} from "./utils/server/company.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "./constant";
import { Toaster } from "@canny_ecosystem/ui/toaster";
import { ErrorBoundary } from "./components/error-boundary";
import {
  getEmployeeIdFromCookie,
  getUserCookieOrFetchUser,
  setUserCookie,
} from "./utils/server/user.server";
import { Button } from "@canny_ecosystem/ui/button";
import { useState } from "react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { PageHeader } from "./components/page-header";
import { getCompanyById } from "@canny_ecosystem/supabase/queries";

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
  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { user, setCookie } = await getUserCookieOrFetchUser(
      request,
      supabase,
    );
    const employeeId = await getEmployeeIdFromCookie(request);

    const headers = new Headers();
    if (setCookie) {
      headers.append("Set-Cookie", setUserCookie(user));
    }

    let companyId = null;

    if (companyId) {
      headers.append("Set-Cookie", setCompanyId(companyId));
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }
    const companyResult = await getCompanyIdOrFirstCompany(request, supabase);
    companyId = companyResult.companyId;

    const { data: companyData, error } = await getCompanyById({ id: companyId, supabase });
    if (error) throw error;


    if (companyResult.setCookie) {
      headers.append("Set-Cookie", setCompanyId(companyId));
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    return json({
      requestInfo: {
        hints: getHints(request),
        path: new URL(request.url).pathname,
        userPrefs: {
          theme: getTheme(request),
          companyId,
          user,
          employeeId,
          companyData,
        },
      },
      error: null,
    });
  } catch (error) {
    return json({
      error,
      requestInfo: {
        hints: null,
        path: new URL(request.url).pathname,
        userPrefs: {
          theme: null,
          companyId: null,
          user: null,
          employeeId: null,
          companyData: null,
        },
      },
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.root, args);
}

clientLoader.hydrate = true;

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
    error,
    requestInfo: {
      userPrefs: { theme: initialTheme, user, employeeId, companyData },
    },
  } = useLoaderData<typeof loader>();
  const [isLoading, setLoading] = useState(false);
  const submit = useSubmit();

  const handleLogout = () => {
    setLoading(true);
    clearAllCache();
    submit({}, { method: "post", action: "/logout", replace: true, });
    setLoading(false);
  };

  // if (error) return <ErrorBoundary error={error} />;

  const nonce = useNonce();
  const { theme } = useTheme();

  return (
    <Document nonce={nonce} theme={theme}>
      <main className="flex h-full w-full bg-background text-foreground ">
        {!user?.email ? (
          <div className='w-full h-full'>
            <header className='flex justify-between items-center mx-5 mt-4 md:mx-4 md:mt-6'>
              <div>
                <Link to={DEFAULT_ROUTE}>
                  <Logo />
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <ThemeSwitch theme={initialTheme ?? "system"} />
                <Button className={cn(!employeeId && "hidden")} variant={"outline"} onClick={handleLogout}>{isLoading ? "Loading..." : "Logout"}</Button>
              </div>
            </header>
            <Outlet />
          </div>
        ) : (<div className="w-full h-full">
          <PageHeader company={companyData} user={user} />
          <Outlet />
        </div>
        )}
        <Toaster />
      </main>
    </Document>
  );
}

export default function AppWithProviders() {
  return <App />;
}

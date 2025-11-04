import {
  json,
  type LoaderFunctionArgs,
  type LinksFunction,
  type HeadersFunction,
} from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/remix";
import { clientCaching } from "./utils/cache";
import tailwindStyleSheetUrl from "@/styles/tailwind.css?url";
import { getTheme } from "./utils/server/theme.server";
import { useTheme } from "./utils/theme";
import { href as iconsHref } from "@canny_ecosystem/ui/icon";
import { ClientHintCheck, getHints } from "./utils/client-hints";
import { useNonce } from "./utils/providers/nonce-provider";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { cacheKeyPrefix } from "./constant";
import { Toaster } from "@canny_ecosystem/ui/toaster";
import { ErrorBoundary } from "./components/error-boundary";
import {
  getEmployeeIdFromCookie,
  getUserCookieOrFetchUser,
  setUserCookie,
} from "./utils/server/user.server";

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
      supabase
    );
    const employeeId = await getEmployeeIdFromCookie(request);

    const headers = new Headers();
    if (setCookie) {
      headers.append("Set-Cookie", setUserCookie(user));
    }

    return json({
      requestInfo: {
        hints: getHints(request),
        path: new URL(request.url).pathname,
        userPrefs: {
          theme: getTheme(request),
          user,
          employeeId,
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
          user: null,
          employeeId: null,
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
        <Analytics />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function App() {
  const { error } = useLoaderData<typeof loader>();

  if (error) return <ErrorBoundary error={error} />;

  const nonce = useNonce();
  const { theme } = useTheme();

  return (
    <Document nonce={nonce} theme={theme}>
      <main className="flex h-full w-full bg-background text-foreground ">
        <div className="w-full h-full">
          <Outlet />
        </div>
        <Toaster />
      </main>
    </Document>
  );
}

export default function AppWithProviders() {
  return <App />;
}

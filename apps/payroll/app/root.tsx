import {
  json,
  type LoaderFunctionArgs,
  type LinksFunction,
  type HeadersFunction,
} from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import tailwindStyleSheetUrl from "@/styles/tailwind.css?url";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { getTheme } from "./utils/server/theme.server";
import { useTheme } from "./utils/theme";
// import { href as iconsHref } from './components/ui/icon'
import { ClientHintCheck, getHints } from "./utils/client-hints";
// import { getDomainUrl } from './utils/misx'
// import { useNonce } from './utils/providers/nonce-provider'

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStyleSheetUrl }].filter(Boolean);
};

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
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
    requestInfo: {
      userPrefs: { theme: initialTheme },
    },
  } = useLoaderData<typeof loader>();

  const theme = useTheme();
  return (
    <Document nonce={"nonce"} theme={theme}>
      <main className="flex h-full w-full bg-background text-foreground ">
        <Sidebar className="flex-none" />
        <div className="flex max-h-screen flex-grow flex-col overflow-scroll px-4">
          <Header theme={initialTheme || "system"} />
          <Outlet />
        </div>
      </main>
    </Document>
  );
}

function AppWithProviders() {
  return <App />;
}

export default AppWithProviders;

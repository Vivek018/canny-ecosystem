import { getSitesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@canny_ecosystem/ui/command";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/react";
import { Suspense } from "react";
import { SitesWrapper } from "@/components/sites/sites-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { hasPermission, createRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { LoadingSpinner } from "@/components/loading-spinner";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const sitesPromise = getSitesByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      error: null,
      sitesPromise,
    });
  } catch (error) {
    return json(
      {
        error,
        sitesPromise: null,
      },
      { status: 500 },
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.sites, args);
}

clientLoader.hydrate = true;

export default function SitesIndex() {
  const { role } = useUser();
  const { sitesPromise, error } = useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.sites);
    return <ErrorBoundary error={error} message="Failed to load sites" />;
  }

  return (
    <section className="pb-4 px-4">
      <div className="w-full flex items-end justify-between">
        <Suspense fallback={<LoadingSpinner className="h-1/2 mt-20" />}>
          <Await resolve={sitesPromise}>
            {(resolvedData) => {
              if (!resolvedData) {
                clearExactCacheEntry(cacheKeyPrefix.sites);
                return <ErrorBoundary message="Failed to load sites" />;
              }
              return (
                <Command className="overflow-visible">
                  <div className="w-full py-4 lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
                    <CommandInput
                      divClassName="border border-input rounded-md h-10 flex-1"
                      placeholder="Search Sites"
                      autoFocus={true}
                    />
                    <Link
                      to={"create-site"}
                      className={cn(
                        buttonVariants({ variant: "primary-outline" }),
                        "flex items-center gap-1",
                        !hasPermission(
                          role,
                          `${createRole}:${attribute.sites}`,
                        ) && "hidden",
                      )}
                    >
                      <span>Add</span>
                      <span className="hidden md:flex justify-end">Site</span>
                    </Link>
                  </div>
                  <CommandEmpty
                    className={cn(
                      "w-full py-40 capitalize text-lg tracking-wide text-center",
                      !isDocument && "hidden",
                    )}
                  >
                    No site found.
                  </CommandEmpty>
                  <CommandList className="max-h-full py-2 overflow-x-visible overflow-y-visible">
                    <SitesWrapper
                      data={resolvedData.data}
                      error={resolvedData.error}
                    />
                  </CommandList>
                </Command>
              );
            }}
          </Await>
        </Suspense>
      </div>
      <Outlet />
    </section>
  );
}

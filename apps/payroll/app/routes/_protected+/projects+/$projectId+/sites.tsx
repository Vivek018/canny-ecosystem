import { getSitesByProjectId } from "@canny_ecosystem/supabase/queries";
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
import { SitesWrapper } from "@/components/projects/sites/sites-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { hasPermission, createRole } from "@canny_ecosystem/utils";
import { useUserRole } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    if (!projectId) throw new Error("No projectId provided");

    const sitesPromise = getSitesByProjectId({
      supabase,
      projectId,
    });

    return defer({
      error: null,
      sitesPromise,
      projectId,
    });
  } catch (error) {
    return json(
      {
        error,
        projectId,
        sitesPromise: null,
      },
      { status: 500 }
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(
    `${cacheKeyPrefix.sites}${args.params.projectId}`,
    args
  );
}

clientLoader.hydrate = true;

export default function Sites() {
  const { role } = useUserRole();
  const { sitesPromise, projectId, error } = useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  if (error) {
    clearCacheEntry(`${cacheKeyPrefix.sites}${projectId}`);
    return <ErrorBoundary error={error} message='Failed to load sites' />;
  }

  return (
    <section className='pb-4'>
      <div className='w-full flex items-end justify-between'>
        <Command className='overflow-visible'>
          <div className='w-full md:w-3/4 lg:w-1/2 2xl:w-1/3 py-4 flex items-center gap-4'>
            <CommandInput
              divClassName='border border-input rounded-md h-10 flex-1'
              placeholder='Search Sites'
              autoFocus={true}
            />
            <Link
              to={`/projects/${projectId}/sites/create-site`}
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",
                !hasPermission(
                  role,
                  `${createRole}:${attribute.projectSites}`
                ) && "hidden"
              )}
            >
              <span>Add</span>
              <span className='hidden md:flex justify-end'>Site</span>
            </Link>
          </div>
          <CommandEmpty
            className={cn(
              "w-full py-40 capitalize text-lg tracking-wide text-center",
              !isDocument && "hidden"
            )}
          >
            No site found.
          </CommandEmpty>
          <CommandList className='max-h-full py-2 overflow-x-visible overflow-y-visible'>
            <Suspense fallback={<div>Loading...</div>}>
              <Await resolve={sitesPromise}>
                {(resolvedData) => {
                  if (!resolvedData) {
                    clearCacheEntry(`${cacheKeyPrefix.sites}${projectId}`);
                    return <ErrorBoundary message='Failed to load sites' />;
                  }
                  return (
                    <SitesWrapper
                      data={resolvedData.data}
                      error={resolvedData.error}
                    />
                  );
                }}
              </Await>
            </Suspense>
          </CommandList>
        </Command>
      </div>
      <Outlet />
    </section>
  );
}

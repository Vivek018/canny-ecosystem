import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getProjectsByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
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
  json,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ProjectsWrapper } from "@/components/projects/projects-wrapper";
import { hasPermission, createRole } from "@canny_ecosystem/utils";
import { useUserRole } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase} = getSupabaseWithHeaders({ request });

  
  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const projectsPromise = getProjectsByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      status: "success",
      message: "Projects found",
      error: null,
      projectsPromise,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to load projects",
        error,
        projectsPromise: null,
      },
      { status: 500 }
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(cacheKeyPrefix.projects, args);
}

clientLoader.hydrate = true;

export default function ProjectsIndex() {
  const { role } = useUserRole();
  const { projectsPromise, error } = useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  if (error) {
    return <ErrorBoundary error={error} message="Failed to load projects" />;
  }

  return (
    <section className="py-4 px-4">
      <div className="w-full flex items-end justify-between">
        <Command className="overflow-visible">
          <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
            <CommandInput
              divClassName="border border-input rounded-md h-10 flex-1"
              placeholder="Search Projects"
              autoFocus={true}
            />
            <Link
              to="/projects/create-project"
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",
                !hasPermission(role, `${createRole}:${attribute.projects}`) &&
                  "hidden"
              )}
            >
              <span>Add</span>
              <span className="hidden md:flex justify-end">Project</span>
            </Link>
          </div>
          <CommandEmpty
            className={cn(
              "w-full py-40 capitalize text-lg tracking-wide text-center",
              !isDocument && "hidden"
            )}
          >
            No project found.
          </CommandEmpty>
          <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
            <CommandGroup className="p-0 overflow-visible">
              <Suspense fallback={<div>Loading...</div>}>
                <Await resolve={projectsPromise}>
                  {(resolvedData) => {
                    if (!resolvedData)
                      return (
                        <ErrorBoundary message="Failed to load projects" />
                      );
                    return (
                      <ProjectsWrapper
                        data={resolvedData.data}
                        error={resolvedData.error}
                      />
                    );
                  }}
                </Await>
              </Suspense>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
      <Outlet />
    </section>
  );
}

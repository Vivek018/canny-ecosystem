import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getRelationshipsByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import { Await, Link, Outlet, useLoaderData } from "@remix-run/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@canny_ecosystem/ui/command";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { RelationshipWrapper } from "@/components/relationships/relationship-wrapper";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUserRole } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const relationshipsPromise = getRelationshipsByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      relationshipsPromise,
      error: null,
    });
  } catch (error) {
    return defer({
      error,
      relationshipsPromise: null,
    });
  }
}

export default function Relationships() {
  const { role } = useUserRole();
  const { relationshipsPromise, error } = useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  if (error)
    return (
      <ErrorBoundary error={error} message="Failed to load relationships" />
    );

  return (
    <section className="py-4">
      <div className="w-full flex items-end justify-between">
        <Command className="overflow-visible">
          <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
            <CommandInput
              divClassName="border border-input rounded-md h-10 flex-1"
              placeholder="Search Relationships"
              autoFocus={true}
            />
            <Link
              to="/settings/create-relationship"
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",
                !hasPermission(
                  role,
                  `${updateRole}:${attribute.settingRelationships}`
                ) && "hidden"
              )}
            >
              <span>Add</span>
              <span className="hidden md:flex justify-end">Relationship</span>
            </Link>
          </div>
          <CommandEmpty
            className={cn(
              "w-full py-40 capitalize text-lg tracking-wide text-center",
              !isDocument && "hidden"
            )}
          >
            No relationships found.
          </CommandEmpty>
          <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
            <CommandGroup className="p-0 overflow-visible">
              <Suspense fallback={<div>Loading...</div>}>
                <Await resolve={relationshipsPromise}>
                  {(resolvedData) => {
                    if (!resolvedData)
                      return (
                        <ErrorBoundary message="Failed to load relationships" />
                      );
                    return (
                      <RelationshipWrapper
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

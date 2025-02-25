import { ErrorBoundary } from "@/components/error-boundary";
import { PaySequenceCard } from "@/components/pay-sequence/pay-sequence-card";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { useUser } from "@/utils/user";
import {
  getPaySequenceByCompanyId,
  type PaySequenceDataType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@canny_ecosystem/ui/command";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.paySequence}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const paySequencePromise = getPaySequenceByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      paySequencePromise: paySequencePromise as any,
    });
  } catch (error) {
    console.error("Pay Sequence Error in loader function:", error);

    return defer({
      paySequencePromise: Promise.resolve({ data: [] }),
    });
  }
}
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return await clientCaching(
    `${cacheKeyPrefix.paySequence}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export default function PaySequence() {
  const { role } = useUser();
  const { isDocument } = useIsDocument();
  const { paySequencePromise } = useLoaderData<typeof loader>();
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={paySequencePromise}>
          {({ data, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.paySequence);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load pay sequence"
                />
              );
            }

            return (
              <section className="py-4">
                <div className="w-full flex items-end justify-between">
                  <Command className="overflow-visible">
                    <div className="w-[700px] flex items-center gap-4">
                      <CommandInput
                        divClassName="border border-input rounded-md h-10 flex-1"
                        placeholder="Search Pay Sequence"
                        autoFocus={true}
                      />
                      <Link
                        to="add-pay-sequence"
                        className={cn(
                          buttonVariants({ variant: "primary-outline" }),
                          "flex items-center gap-1",
                          !hasPermission(
                            role,
                            `${createRole}:${attribute.paySequence}`
                          ) && "hidden"
                        )}
                      >
                        <span>Add</span>
                        <span className="hidden md:flex justify-end">
                          Pay Sequence
                        </span>
                      </Link>
                    </div>
                    <CommandEmpty
                      className={cn(
                        "w-full py-40 capitalize text-lg tracking-wide text-center",
                        !isDocument && "hidden"
                      )}
                    >
                      No pay sequence found.
                    </CommandEmpty>
                    <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
                      <CommandGroup className="p-0 overflow-visible">
                        <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-1 2xl:grid-cols-2">
                          {data?.map((paySequence: PaySequenceDataType) => (
                            <CommandItem
                              key={paySequence?.id}
                              className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
                            >
                              <PaySequenceCard paySequence={paySequence} />
                            </CommandItem>
                          ))}
                        </div>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              </section>
            );
          }}
        </Await>
      </Suspense>
      <Outlet />
    </div>
  );
}

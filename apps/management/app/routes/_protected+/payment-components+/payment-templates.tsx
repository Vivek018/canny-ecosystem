import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PaymentTemplatesTableWrapper } from "@/components/payment-templates/payment-templates-table-wrapper";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { useUser } from "@/utils/user";
import { getPaymentTemplatesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { hasPermission, createRole, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${readRole}:${attribute.paymentTemplates}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const paymentTemplatesPromise = getPaymentTemplatesByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      paymentTemplatesPromise,
      error: null,
    });
  } catch (error) {
    return defer(
      {
        paymentTemplatesPromise: null,
        error,
      },
      { status: 500 },
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.payment_templates, args);
}

clientLoader.hydrate = true;

export default function PaymentTemplates() {
  const { role } = useUser();
  const { paymentTemplatesPromise, error } = useLoaderData<typeof loader>();

  const [searchString, setSearchString] = useState("");

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.payment_templates);
    return (
      <ErrorBoundary error={error} message="Failed to load payment fields" />
    );
  }

  return (
    <>
      <section className="p-4">
        <div className="w-full flex items-center justify-between pb-4">
          <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Icon
                  name="magnifying-glass"
                  size="sm"
                  className="text-gray-400"
                />
              </div>
              <Input
                placeholder="Search Payment Templates"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                className="pl-8 h-10 w-full focus-visible:ring-0 shadow-none"
              />
            </div>
            <Link
              to="/payment-components/payment-templates/create-payment-template"
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",

                !hasPermission(
                  role,
                  `${createRole}:${attribute.paymentTemplates}`,
                ) && "hidden",
              )}
            >
              <span>Add</span>
              <span className="hidden md:flex justify-end">
                Payment Template
              </span>
            </Link>
          </div>
        </div>
        <Suspense fallback={<LoadingSpinner className="mt-30" />}>
          <Await resolve={paymentTemplatesPromise}>
            {(resolvedData) => {
              if (!resolvedData) {
                clearExactCacheEntry(cacheKeyPrefix.payment_templates);
                return (
                  <ErrorBoundary message="Failed to load payment fields" />
                );
              }
              return (
                <PaymentTemplatesTableWrapper
                  data={resolvedData?.data}
                  error={resolvedData?.error}
                  searchString={searchString}
                />
              );
            }}
          </Await>
        </Suspense>
        <Outlet />
      </section>
    </>
  );
}

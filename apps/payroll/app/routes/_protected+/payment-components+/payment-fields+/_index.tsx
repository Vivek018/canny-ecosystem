import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getPaymentFieldsByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  json,
  Link,
  useLoaderData,
} from "@remix-run/react";
import { Input } from "@canny_ecosystem/ui/input";
import { Suspense, useState } from "react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { ErrorBoundary } from "@/components/error-boundary";
import { PaymentFieldTableWrapper } from "@/components/payment-field/payment-field-table-wrapper";
import { hasPermission, createRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const paymentFieldPromise = getPaymentFieldsByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      paymentFieldPromise,
      error: null,
    });
  } catch (error) {
    return json({ paymentFieldPromise: null, error }, { status: 500 });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(cacheKeyPrefix.payment_fields, args);
}

clientLoader.hydrate = true;

export default function PaymentFieldsIndex() {
  const { role } = useUser();
  const { paymentFieldPromise, error } = useLoaderData<typeof loader>();

  const [searchString, setSearchString] = useState("");

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.payment_fields);
    return (
      <ErrorBoundary error={error} message='Failed to load payment fields' />
    );
  }

  return (
    <>
      <section className='p-4'>
        <div className='w-full flex items-center justify-between pb-4'>
          <div className='w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4'>
            <div className='relative w-full'>
              <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                <Icon
                  name='magnifying-glass'
                  size='sm'
                  className='text-gray-400'
                />
              </div>
              <Input
                placeholder='Search Payment Fields'
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                className='pl-8 h-10 w-full focus-visible:ring-0'
              />
            </div>
            <Link
              to='/payment-components/payment-fields/create-payment-field'
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",
                !hasPermission(
                  role,
                  `${createRole}:${attribute.paymentFields}`
                ) && "hidden"
              )}
            >
              <span>Add</span>
              <span className='hidden md:flex justify-end'>Payment Field</span>
            </Link>
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={paymentFieldPromise}>
            {(resolvedData) => {
              if (!resolvedData) {
                clearExactCacheEntry(cacheKeyPrefix.payment_fields);
                return (
                  <ErrorBoundary message='Failed to load payment fields' />
                );
              }
              return (
                <PaymentFieldTableWrapper
                  data={resolvedData?.data}
                  error={resolvedData?.error}
                  searchString={searchString}
                />
              );
            }}
          </Await>
        </Suspense>
      </section>
    </>
  );
}

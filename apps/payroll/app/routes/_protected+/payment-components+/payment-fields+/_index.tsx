import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getPaymentFieldsByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
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

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
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
    return defer({ paymentFieldPromise: null, error }, { status: 500 });
  }
}

export type LoaderData = Awaited<ReturnType<typeof loader>>["data"];

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const cacheKey = "payment-fields";
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    const parsedData = JSON.parse(cachedData) as LoaderData | null;
    if (parsedData) {
      return parsedData;
    }
  }

  const serverData = (await serverLoader()) as LoaderData;
  const resolvedData: Record<string, unknown> = {};

  for (const [key, promise] of Object.entries(serverData)) {
    try {
      resolvedData[key] = await promise;
    } catch {
      resolvedData[key] = null;
    }
  }
  sessionStorage.setItem(cacheKey, JSON.stringify(resolvedData));

  return resolvedData;
}

clientLoader.hydrate = true;

export default function PaymentFieldsIndex() {
  const { paymentFieldPromise, error } = useLoaderData<typeof loader>();

  const [searchString, setSearchString] = useState("");

  if (error)
    return (
      <ErrorBoundary error={error} message='Failed to load payment fields' />
    );

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
                "flex items-center gap-1"
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
              if (!resolvedData)
                return (
                  <ErrorBoundary message='Failed to load payment fields' />
                );
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

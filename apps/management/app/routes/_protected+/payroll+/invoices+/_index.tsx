import { ErrorBoundary } from "@/components/error-boundary";
import { columns } from "@/components/invoice/table/columns";
import { InvoiceTable } from "@/components/invoice/table/data-table";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getInvoicesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { InvoiceDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  json,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {
    const invoicePromise = await getInvoicesByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      invoicePromise: invoicePromise as any,
      companyId,
      error: null,
    });
  } catch (error) {
    return json(
      { invoicePromise: Promise.resolve({ data: [] }), companyId, error },
      { status: 500 }
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(`${cacheKeyPrefix.payroll_invoice}`, args);
}
clientLoader.hydrate = true;

export default function Invoices() {
  const { invoicePromise } = useLoaderData<typeof loader>();
  const [searchString, setSearchString] = useState("");

  return (
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
              placeholder="Search Invice"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="pl-8 h-10 w-full focus-visible:ring-0 shadow-none"
            />
          </div>
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <Await resolve={invoicePromise}>
          {({ data, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.reimbursements);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load reimbursements"
                />
              );
            }

            return (
              <InvoiceTable
                data={data as unknown as InvoiceDatabaseRow[]}
                columns={columns}
              />
            );
          }}
        </Await>
      </Suspense>
      <Outlet />
    </section>
  );
}

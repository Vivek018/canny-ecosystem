import { LoadingSpinner } from "@/components/loading-spinner";
import { columns } from "@/components/payee/table/columns";
import { PayeeDataTable } from "@/components/payee/table/data-table";
import { cacheKeyPrefix } from "@/constant";
import { clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useUser } from "@/utils/user";

import { getPayeesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PayeeDatabaseRow } from "@canny_ecosystem/supabase/types";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  hasPermission,
  createRole,
  searchInObject,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Link,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const payeePromise = getPayeesByCompanyId({ supabase, companyId });

  return defer({ payeePromise });
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.payee, args);
}

clientLoader.hydrate = true;

export default function Payees() {
  const { payeePromise } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<LoadingSpinner className="my-20" />}>
      <Await resolve={payeePromise}>
        {(resolvedData) => {
          return (
            <PayeesWrapper
              data={(resolvedData?.data as PayeeDatabaseRow[]) || []}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function PayeesWrapper({ data }: { data: PayeeDatabaseRow[] }) {
  const { role } = useUser();
  const [tableData, setTableData] = useState(data);
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    const filteredData = data?.filter((item) =>
      searchInObject(item, searchString),
    );
    setTableData(filteredData);
  }, [searchString, data]);

  return (
    <section className="py-4">
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
              placeholder="Search Payee"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="pl-8 h-10 w-full focus-visible:ring-0 shadow-none"
            />
          </div>
          <Link
            to="/settings/payee/create-payee"
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              "flex items-center gap-1",
              !hasPermission(role, `${createRole}:${attribute.settingPayee}`) &&
                "hidden",
            )}
          >
            <span>Add</span>
            <span className="hidden md:flex justify-end">Payee</span>
          </Link>
        </div>
      </div>
      <PayeeDataTable data={tableData} columns={columns} />
    </section>
  );
}

import { LoadingSpinner } from "@/components/loading-spinner";
import { columns } from "@/components/user/table/columns";
import { UserDataTable } from "@/components/user/table/data-table";
import { cacheKeyPrefix } from "@/constant";
import { clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useUser } from "@/utils/user";

import { getUsersByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { UserDatabaseRow } from "@canny_ecosystem/supabase/types";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { hasPermission, createRole, searchInObject } from "@canny_ecosystem/utils";
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

  const usersPromise = getUsersByCompanyId({ supabase, companyId });

  return defer({ usersPromise });
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.users, args);
}

clientLoader.hydrate = true;

export default function Users() {
  const { usersPromise } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<LoadingSpinner className='my-20' />}>
      <Await resolve={usersPromise}>
        {(resolvedData) => {
          return <UsersWrapper data={resolvedData?.data || []} />;
        }}
      </Await>
    </Suspense>
  );
}

export function UsersWrapper({
  data,
}: {
  data: Omit<
    UserDatabaseRow,
    | "created_at"
    | "updated_at"
    | "is_email_verified"
    | "is_mobile_verified"
    | "last_login"
    | "preferred_language"
  >[];
}) {
  const { role } = useUser();
  const [tableData, setTableData] = useState(data);
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    const filteredData = data?.filter((item: any) =>
          searchInObject(item, searchString),
        );
    
        setTableData(filteredData);
  }, [searchString, data]);

  return (
    <section className='py-4'>
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
              placeholder='Search Users'
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className='pl-8 h-10 w-full focus-visible:ring-0 shadow-none'
            />
          </div>
          <Link
            to='/settings/users/create-user'
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              "flex items-center gap-1",
              !hasPermission(role, `${createRole}:${attribute.settingUsers}`) &&
                "hidden"
            )}
          >
            <span>Add</span>
            <span className='hidden md:flex justify-end'>User</span>
          </Link>
        </div>
      </div>
      <UserDataTable data={tableData} columns={columns} />
    </section>
  );
}

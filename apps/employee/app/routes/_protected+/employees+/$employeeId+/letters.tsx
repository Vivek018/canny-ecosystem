import { EmployeeLetterTableWrapper } from "@/components/employees/employee/letters/employee-letter-table-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { useUser } from "@/utils/user";
import { getEmployeeLettersByEmployeeId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { defer, json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useState } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { employeeId } = params;
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const employeeLettersPromise = getEmployeeLettersByEmployeeId({
      supabase,
      employeeId: employeeId ?? "",
    });

    return defer({
      employeeLettersPromise,
      employeeId,
      error: null,
    });
  } catch (error) {
    return json(
      { employeeLettersPromise: null, employeeId, error },
      { status: 500 }
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    `${cacheKeyPrefix.employee_letters}${args.params.employeeId}`,
    args
  );
}

clientLoader.hydrate = true;

export default function Letters() {
  const { role } = useUser();
  const { employeeLettersPromise, employeeId, error } =
    useLoaderData<typeof loader>();

  const [searchString, setSearchString] = useState("");

  if (error) {
    clearExactCacheEntry(`${cacheKeyPrefix.employee_letters}${employeeId}`);
    return (
      <ErrorBoundary error={error} message='Failed to load payment fields' />
    );
  }

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
              placeholder='Search Letters'
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className='pl-8 h-10 w-full focus-visible:ring-0 shadow-none'
            />
          </div>
          <Link
            to={`/employees/${employeeId}/letters/create-letter`}
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              "flex items-center gap-1",
              !hasPermission(
                role,
                `${createRole}:${attribute.employeeLetters}`
              ) && "hidden"
            )}
          >
            <span>Add</span>
            <span className='hidden md:flex justify-end'>Letter</span>
          </Link>
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <Await resolve={employeeLettersPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.employee_letters}${employeeId}`
              );
              return <ErrorBoundary message='Failed to load letters' />;
            }
            return (
              <EmployeeLetterTableWrapper
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
  );
}

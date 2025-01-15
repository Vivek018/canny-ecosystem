import { EmployeeAddressesCard } from "@/components/employees/employee/addresses-card";
import { EmployeeBankDetailsCard } from "@/components/employees/employee/bank-details-card";
import { EmployeeDetailsCard } from "@/components/employees/employee/details-card";
import { EmployeeGuardiansCard } from "@/components/employees/employee/guardians-card";
import { EmployeePageHeader } from "@/components/employees/employee/page-header";
import { EmployeeStatutoryCard } from "@/components/employees/employee/statutory-card";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  getEmployeeAddressesByEmployeeId,
  getEmployeeBankDetailsById,
  getEmployeeById,
  getEmployeeGuardiansByEmployeeId,
  getEmployeeStatutoryDetailsById,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  useLoaderData,
} from "@remix-run/react";
import { type ReactNode, Suspense, useEffect } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const employeePromise = getEmployeeById({
      supabase,
      id: employeeId ?? "",
    });

    const employeeStatutoryDetailsPromise = getEmployeeStatutoryDetailsById({
      supabase,
      id: employeeId ?? "",
    });

    const employeeBankDetailsPromise = getEmployeeBankDetailsById({
      supabase,
      id: employeeId ?? "",
    });

    const employeeAddressesPromise = getEmployeeAddressesByEmployeeId({
      supabase,
      employeeId: employeeId ?? "",
    });

    const employeeGuardiansPromise = getEmployeeGuardiansByEmployeeId({
      supabase,
      employeeId: employeeId ?? "",
    });

    const env = {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    };

    return defer({
      employeePromise,
      employeeStatutoryDetailsPromise,
      employeeBankDetailsPromise,
      employeeAddressesPromise,
      employeeGuardiansPromise,
      env,
      error: null,
    });
  } catch (error) {
    return defer({
      error,
      env: null,
      employeePromise: null,
      employeeStatutoryDetailsPromise: null,
      employeeBankDetailsPromise: null,
      employeeAddressesPromise: null,
      employeeGuardiansPromise: null,
    });
  }
}

export type LoaderData = Awaited<ReturnType<typeof loader>>["data"];

export async function clientLoader({
  serverLoader,
  params,
}: ClientLoaderFunctionArgs) {
  const cacheKey = `employee-${params.employeeId}-overview`;
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

export default function EmployeeIndex() {
  const {
    error,
    env,
    employeePromise,
    employeeStatutoryDetailsPromise,
    employeeBankDetailsPromise,
    employeeAddressesPromise,
    employeeGuardiansPromise,
  } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <ErrorBoundary error={error} message='Failed to load employee details' />
    );
  }

  return (
    <div className='w-full py-6 flex flex-col gap-8'>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={employeePromise}>
          {(resolvedData) => {
            if (!resolvedData || !env)
              return <ErrorBoundary message='Failed to load employee' />;
            return (
              <>
                <CommonWrapper
                  error={resolvedData.error}
                  Component={
                    <EmployeePageHeader
                      employee={resolvedData.data!}
                      env={env}
                    />
                  }
                />
                <CommonWrapper
                  error={resolvedData.error}
                  Component={
                    <EmployeeDetailsCard employee={resolvedData.data!} />
                  }
                />
              </>
            );
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={employeeStatutoryDetailsPromise}>
          {(resolvedData) => {
            if (!resolvedData)
              return (
                <ErrorBoundary message='Failed to load employee statutory details' />
              );
            return (
              <CommonWrapper
                error={resolvedData.error}
                Component={
                  <EmployeeStatutoryCard
                    employeeStatutory={resolvedData.data}
                  />
                }
              />
            );
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={employeeBankDetailsPromise}>
          {(resolvedData) => {
            if (!resolvedData)
              return (
                <ErrorBoundary message='Failed to load employee bank details' />
              );
            return (
              <CommonWrapper
                error={resolvedData.error}
                Component={
                  <EmployeeBankDetailsCard bankDetails={resolvedData.data} />
                }
              />
            );
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={employeeAddressesPromise}>
          {(resolvedData) => {
            if (!resolvedData)
              return (
                <ErrorBoundary message='Failed to load employee addresses' />
              );
            return (
              <CommonWrapper
                error={resolvedData.error}
                Component={
                  <EmployeeAddressesCard
                    employeeAddresses={resolvedData.data}
                  />
                }
              />
            );
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={employeeGuardiansPromise}>
          {(resolvedData) => {
            if (!resolvedData)
              return (
                <ErrorBoundary message='Failed to load employee guardians details' />
              );
            return (
              <CommonWrapper
                error={resolvedData.error}
                Component={
                  <EmployeeGuardiansCard
                    employeeGuardians={resolvedData.data}
                  />
                }
              />
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}

export function CommonWrapper({
  Component,
  error,
}: {
  Component: ReactNode;
  error: any;
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load employee details",
        variant: "destructive",
      });
    }
  }, [error]);

  return Component;
}

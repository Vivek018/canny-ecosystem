import { EmployeeWorkDetailsCard } from "@/components/employees/work-portfolio/work-details-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import {
  getEmployeeWorkDetailsByEmployeeId,
  type EmployeeWorkDetailsDataType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { type ReactNode, Suspense, useEffect } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const employeeId = params.employeeId;

  try {
    const employeeWorkDetailsPromise = getEmployeeWorkDetailsByEmployeeId({
      supabase,
      employeeId: employeeId ?? "",
    });

    return defer({
      employeeWorkDetailsPromise,
      error: null,
    });
  } catch (error) {
    return defer({
      error,
      employeeWorkDetailsPromise: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    `${cacheKeyPrefix.employee_work_portfolio}${args.params.employeeId}`,
    args
  );
}

clientLoader.hydrate = true;

export default function WorkPortfolio() {
  const { employeeWorkDetailsPromise, error } = useLoaderData<typeof loader>();
  const { employeeId } = useParams();

  if (error) {
    clearExactCacheEntry(
      `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`
    );
    return <ErrorBoundary error={error} message="Failed to load data" />;
  }

  return (
    <div className="w-full py-4 flex flex-col gap-8">
      <Suspense fallback={<LoadingSpinner className="h-1/4 mt-20" />}>
        <Await resolve={employeeWorkDetailsPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`
              );
              return (
                <ErrorBoundary message="Failed to load employee work details" />
              );
            }
            return (
              <CommonWrapper
                Component={
                  <EmployeeWorkDetailsCard
                    workDetails={
                      resolvedData.data as EmployeeWorkDetailsDataType[]
                    }
                  />
                }
                error={resolvedData.error}
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
  const { employeeId } = useParams();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(
        `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`
      );
      toast({
        title: "Error",
        description:
          error?.message || "Failed to load employee work portfolio details",
        variant: "destructive",
      });
    }
  }, [error]);

  return Component;
}

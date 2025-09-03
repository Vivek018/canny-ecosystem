import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { VehicleDetailsCard } from "@/components/vehicles/details-card";
import { VehicleInsuranceCard } from "@/components/vehicles/insurance/insurance-card";
import {
  type VehicleLoan,
  VehicleLoanCard,
} from "@/components/vehicles/loan/loan-card";
import { VehiclePageHeader } from "@/components/vehicles/page-header";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import {
  getVehicleById,
  getVehicleInsuranceByVehicleId,
  getVehicleLoanDetailsByVehicleId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type {
  VehiclesDatabaseRow,
  VehiclesInsuranceDatabaseRow,
} from "@canny_ecosystem/supabase/types";
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

  const vehicleId = params.vehicleId ?? "";

  try {
    const vehiclePromise = getVehicleById({
      supabase,
      id: vehicleId ?? "",
    });

    const vehicleInsurancePromise = getVehicleInsuranceByVehicleId({
      supabase,
      vehicleId: vehicleId ?? "",
    });

    const vehicleLoanPromise = getVehicleLoanDetailsByVehicleId({
      supabase,
      vehicleId: vehicleId ?? "",
    });

    const env = {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    };

    return defer({
      vehiclePromise,
      vehicleLoanPromise,
      vehicleInsurancePromise,
      env,
      error: null,
    });
  } catch (error) {
    return defer({
      error,
      env: null,
      vehicleLoanPromise: null,
      vehiclePromise: null,
      vehicleInsurancePromise: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    `${cacheKeyPrefix.vehicle_overview}${args.params.vehicleId}`,
    args,
  );
}

clientLoader.hydrate = true;

export default function VehicleIndex() {
  const {
    error,
    env,
    vehicleInsurancePromise,
    vehicleLoanPromise,
    vehiclePromise,
  } = useLoaderData<typeof loader>();
  const { vehicleId } = useParams();

  if (error) {
    clearExactCacheEntry(`${cacheKeyPrefix.vehicle_overview}${vehicleId}`);
    return (
      <ErrorBoundary error={error} message="Failed to load vehicle details" />
    );
  }

  return (
    <div className="w-full py-6 flex flex-col gap-8">
      <Suspense fallback={<LoadingSpinner />}>
        <Await resolve={vehiclePromise}>
          {(resolvedData) => {
            if (!resolvedData || !env) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.vehicle_overview}${vehicleId}`,
              );
              return <ErrorBoundary message="Failed to load vehicle" />;
            }
            return (
              <>
                <CommonWrapper
                  error={resolvedData.error}
                  Component={
                    <VehiclePageHeader
                      vehicle={
                        resolvedData.data! as unknown as VehiclesDatabaseRow
                      }
                      env={env}
                    />
                  }
                />
                <CommonWrapper
                  error={resolvedData.error}
                  Component={
                    <VehicleDetailsCard vehicle={resolvedData.data!} />
                  }
                />
              </>
            );
          }}
        </Await>
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <Await resolve={vehicleLoanPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.vehicle_overview}${vehicleId}`,
              );
              return <ErrorBoundary message="Failed to load vehicle loan" />;
            }
            return (
              <CommonWrapper
                error={resolvedData.error}
                Component={
                  <VehicleLoanCard
                    vehicleLoan={resolvedData.data as unknown as VehicleLoan}
                  />
                }
              />
            );
          }}
        </Await>
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <Await resolve={vehicleInsurancePromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.vehicle_overview}${vehicleId}`,
              );
              return (
                <ErrorBoundary message="Failed to load vehicle insurance" />
              );
            }
            return (
              <CommonWrapper
                error={resolvedData.error}
                Component={
                  <VehicleInsuranceCard
                    vehicleInsurance={
                      resolvedData.data as unknown as VehiclesInsuranceDatabaseRow[]
                    }
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
  const { vehicleId } = useParams();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(`${cacheKeyPrefix.vehicle_overview}${vehicleId}`);
      toast({
        title: "Error",
        description: error?.message || "Failed to load vehicle details",
        variant: "destructive",
      });
    }
  }, [error]);

  return Component;
}

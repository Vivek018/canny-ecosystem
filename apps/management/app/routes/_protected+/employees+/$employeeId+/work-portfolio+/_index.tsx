import { EmployeeProjectAssignmentCard } from "@/components/employees/work-portfolio/project-assignment-card";
import { EmployeeSkillsCard } from "@/components/employees/work-portfolio/skills-card";
import { EmployeeWorkHistoriesCard } from "@/components/employees/work-portfolio/work-history-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import {
  getEmployeeProjectAssignmentByEmployeeId,
  getEmployeeSkillsByEmployeeId,
  getEmployeeWorkHistoriesByEmployeeId,
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
    const employeeProjectAssignmentPromise =
      getEmployeeProjectAssignmentByEmployeeId({
        supabase,
        employeeId: employeeId ?? "",
      });

    const employeeWorkHistoriesPromise = getEmployeeWorkHistoriesByEmployeeId({
      supabase,
      employeeId: employeeId ?? "",
    });

    const employeeSkillsPromise = getEmployeeSkillsByEmployeeId({
      supabase,
      employeeId: employeeId ?? "",
    });

    return defer({
      employeeProjectAssignmentPromise,
      employeeWorkHistoriesPromise,
      employeeSkillsPromise,
      error: null,
    });
  } catch (error) {
    return defer({
      error,
      employeeProjectAssignmentPromise: null,
      employeeWorkHistoriesPromise: null,
      employeeSkillsPromise: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    `${cacheKeyPrefix.employee_work_portfolio}${args.params.employeeId}`,
    args,
  );
}

clientLoader.hydrate = true;

export default function WorkPortfolio() {
  const {
    employeeProjectAssignmentPromise,
    employeeWorkHistoriesPromise,
    employeeSkillsPromise,
    error,
  } = useLoaderData<typeof loader>();
  const { employeeId } = useParams();

  if (error) {
    clearExactCacheEntry(
      `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`,
    );
    return <ErrorBoundary error={error} message="Failed to load data" />;
  }

  return (
    <div className="w-full py-4 flex flex-col gap-8">
      <Suspense fallback={<LoadingSpinner className="h-1/4 mt-20" />}>
        <Await resolve={employeeProjectAssignmentPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`,
              );
              return (
                <ErrorBoundary message="Failed to load employee project assignment" />
              );
            }
            return (
              <CommonWrapper
                Component={
                  <EmployeeProjectAssignmentCard
                    projectAssignment={resolvedData.data}
                  />
                }
                error={resolvedData.error}
              />
            );
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<LoadingSpinner className="h-1/4 mt-20" />}>
        <Await resolve={employeeWorkHistoriesPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`,
              );
              return (
                <ErrorBoundary message="Failed to load employee work history" />
              );
            }
            return (
              <CommonWrapper
                Component={
                  <EmployeeWorkHistoriesCard
                    employeeWorkHistories={resolvedData.data}
                  />
                }
                error={resolvedData.error}
              />
            );
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<LoadingSpinner className="h-1/4 mt-20" />}>
        <Await resolve={employeeSkillsPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`,
              );
              return <ErrorBoundary message="Failed to load employee skills" />;
            }
            return (
              <CommonWrapper
                Component={
                  <EmployeeSkillsCard employeeSkills={resolvedData.data} />
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
}: { Component: ReactNode; error: any }) {
  const { toast } = useToast();
  const { employeeId } = useParams();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(
        `${cacheKeyPrefix.employee_work_portfolio}${employeeId}`,
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

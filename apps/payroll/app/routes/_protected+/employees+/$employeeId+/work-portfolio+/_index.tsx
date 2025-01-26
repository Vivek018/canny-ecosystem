import { EmployeeProjectAssignmentCard } from "@/components/employees/work-portfolio/project-assignment-card";
import { EmployeeSkillsCard } from "@/components/employees/work-portfolio/skills-card";
import { EmployeeWorkHistoriesCard } from "@/components/employees/work-portfolio/work-history-card";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  getEmployeeProjectAssignmentByEmployeeId,
  getEmployeeSkillsByEmployeeId,
  getEmployeeWorkHistoriesByEmployeeId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { defer, json, type LoaderFunctionArgs } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { type ReactNode, Suspense } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  
  const employeeId = params.employeeId;

  try {
    const employeeProjectAssignmentPromise =
      await getEmployeeProjectAssignmentByEmployeeId({
        supabase,
        employeeId: employeeId ?? "",
      });

    const employeeWorkHistoriesPromise =
      await getEmployeeWorkHistoriesByEmployeeId({
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
    return json({
      error,
      employeeProjectAssignmentPromise: null,
      employeeWorkHistoriesPromise: null,
      employeeSkillsPromise: null,
    });
  }
}

export default function WorkPortfolio() {
  const {
    employeeProjectAssignmentPromise,
    employeeWorkHistoriesPromise,
    employeeSkillsPromise,
    error,
  } = useLoaderData<typeof loader>();

  if (error)
    return <ErrorBoundary error={error} message="Failed to load data" />;

  return (
    <div className="w-full py-4 flex flex-col gap-8">
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={employeeProjectAssignmentPromise}>
          {(resolvedData) => {
            if (!resolvedData)
              return (
                <ErrorBoundary message="Failed to load employee project assignment" />
              );
            return (
              <CommonWrapper
                Component={
                  <EmployeeProjectAssignmentCard
                    projectAssignment={resolvedData.data}
                  />
                }
                error={null}
              />
            );
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={employeeWorkHistoriesPromise}>
          {(resolvedData) => {
            if (!resolvedData)
              return (
                <ErrorBoundary message="Failed to load employee work history" />
              );
            return (
              <CommonWrapper
                Component={
                  <EmployeeWorkHistoriesCard
                    employeeWorkHistories={resolvedData.data}
                  />
                }
                error={null}
              />
            );
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={employeeSkillsPromise}>
          {(resolvedData) => {
            if (!resolvedData)
              return <ErrorBoundary message="Failed to load employee skills" />;
            return (
              <CommonWrapper
                Component={
                  <EmployeeSkillsCard employeeSkills={resolvedData.data} />
                }
                error={null}
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
  error: Error | null;
}) {
  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load employee work portfolio"
      />
    );

  return Component;
}

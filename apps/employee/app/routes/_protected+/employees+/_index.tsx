import InchargeEmployees from "@/components/employees/incharge-employees/incharge-employees";
import SupervisorEmployees from "@/components/employees/supervisor-employees/supervisor-employees";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getEmployeeIdFromCookie } from "@/utils/server/user.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  type EmployeeFilters,
  getEmployeesBySiteId,
  getEmployeesBySiteIds,
  getSitesByLocationId,
  getUserByEmail,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";

const pageSize = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase } = getSupabaseWithHeaders({ request });
  const { user } = await getSessionUser({ request });

  const employeeId = await getEmployeeIdFromCookie(request);

  if (employeeId) {
    return safeRedirect(`/employees/${employeeId}/overview`, { status: 303 });
  }

  const { data: userProfile, error: userProfileError } = await getUserByEmail({
    email: user?.email || "",
    supabase,
  });

  if (user?.role === "supervisor" && !userProfile?.site_id)
    throw new Error("No site id found");
  if (user?.role === "location_incharge" && !userProfile?.location_id)
    throw new Error("No location id found");
  if (userProfileError) throw userProfileError;

  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? undefined;

    const page = 0;

    const filters: EmployeeFilters = {
      dob_start: searchParams.get("dob_start") ?? null,
      dob_end: searchParams.get("dob_end") ?? null,
      education: searchParams.get("education") ?? null,
      gender: searchParams.get("gender") ?? null,
      status: searchParams.get("status") ?? null,
      assignment_type: searchParams.get("assignment_type") ?? null,
      position: searchParams.get("position") ?? null,
      skill_level: searchParams.get("skill_level") ?? null,
      doj_start: searchParams.get("doj_start") ?? null,
      doj_end: searchParams.get("doj_end") ?? null,
      dol_start: searchParams.get("dol_start") ?? null,
      dol_end: searchParams.get("dol_end") ?? null,
      site: searchParams.get("site") ?? null,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );
    const { data } = await getSitesByLocationId({
      locationId: userProfile?.location_id!,
      supabase,
    });
    const siteOptions = data?.length ? data?.map((site) => site!.name) : [];

    const siteIdsArray = data?.map((dat) => dat.id).filter(Boolean) as string[];

    let employeesPromise:
      | ReturnType<typeof getEmployeesBySiteIds>
      | ReturnType<typeof getEmployeesBySiteId>
      | undefined;

    if (userProfile?.role === "location_incharge") {
      const promise = getEmployeesBySiteIds({
        supabase,
        siteIds: siteIdsArray,
        params: {
          from: 0,
          to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
          filters,
          searchQuery: query ?? undefined,
          sort: sortParam?.split(":") as [string, "asc" | "desc"],
        },
      });
      employeesPromise = promise;
    }
    if (userProfile?.role === "supervisor") {
      const promise = getEmployeesBySiteId({
        siteId: userProfile.site_id!,
        supabase,
      });

      employeesPromise = promise;
    }

    return defer({
      employeesPromise: employeesPromise as any,
      error: null,
      query,
      role: userProfile?.role,
      siteOptions,
      siteIdsArray,
      filters,
      env,
    });
  } catch (error) {
    console.error("Employees Error in loader function:", error);

    return defer({
      employeesPromise: Promise.resolve({ data: [], error }),
      error,
      query: "",
      role: "",
      siteOptions: [],
      siteIdsArray: [],
      filters: null,
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.employees}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export default function EmployeesIndex() {
  const {
    employeesPromise,
    error,
    query,
    env,
    siteIdsArray,
    filters,
    role,
    siteOptions,
  } = useLoaderData<typeof loader>();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(cacheKeyPrefix.employees);
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to load employees",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <section className="p-4 w-full">
      {role === "supervisor" ? (
        <SupervisorEmployees employeesPromise={employeesPromise} />
      ) : (
        <InchargeEmployees
          employeesPromise={employeesPromise}
          env={env}
          pageSize={pageSize}
          query={query}
          siteOptions={siteOptions as unknown as string[]}
          siteIdsArray={siteIdsArray as string[]}
          filters={filters}
        />
      )}
    </section>
  );
}

import { FilterList } from "@/components/reimbursements/filter-list";
import { ReimbursementSearchFilter } from "@/components/reimbursements/reimbursement-search-filter";
import { columns } from "@/components/reimbursements/table/columns";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import { useUser } from "@/utils/user";
import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getReimbursementsByEmployeeId,
  getUsersEmail,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Link,
  Outlet,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const url = new URL(request.url);
    const employeeId = params.employeeId;
    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? undefined;
    const page = 0;

    const filters = {
      submitted_date_start:
        searchParams.get("submitted_date_start") ?? undefined,
      submitted_date_end: searchParams.get("submitted_date_end") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      is_deductible: searchParams.get("is_deductible") ?? undefined,
      users: searchParams.get("users") ?? undefined,
      name: query,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const usersPromise = getUsersEmail({ supabase });

    let reimbursementPromise = null;
    if (employeeId) {
      reimbursementPromise = getReimbursementsByEmployeeId({
        supabase,
        employeeId: employeeId,
        params: {
          from: 0,
          to: hasFilters
            ? MAX_QUERY_LIMIT
            : page > 0
            ? LAZY_LOADING_LIMIT
            : LAZY_LOADING_LIMIT - 1,
          filters,
          searchQuery: query ?? undefined,
          sort: sortParam?.split(":") as [string, "asc" | "desc"],
        },
      });
    }

    return defer({
      reimbursementPromise: reimbursementPromise as any,
      usersPromise,
      employeeId,
      filters,
      env,
    });
  } catch (error) {
    console.error("Error in loader function:", error);
    return defer({
      reimbursementPromise: Promise.resolve({ data: [] }),
      usersPromise: Promise.resolve({ data: [] }),
      employeeId: "",
      filters: {},
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return await clientCaching(
    `${cacheKeyPrefix.employee_reimbursements}${
      args.params.employeeId
    }${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string | null;

  const searchParams = new URLSearchParams();
  if (prompt && prompt.trim().length > 0) {
    searchParams.append("name", prompt.trim());
  }

  url.search = searchParams.toString();
  return redirect(url.toString());
}

export default function ReimbursementsIndex() {
  const { role } = useUser();
  const { toast } = useToast();
  const { reimbursementPromise, usersPromise, employeeId, filters, env } =
    useLoaderData<typeof loader>();

  const noFilters = Object.values(filters).every((value) => !value);

  return (
    <section className='py-4'>
      <Suspense>
        <Await
          resolve={Promise.all([reimbursementPromise, usersPromise])}
          errorElement={
            <div>Error loading filters. Please try again later.</div>
          }
        >
          {([{ data, meta, error }, usersData]) => {
            if (error) {
              clearCacheEntry(
                `${cacheKeyPrefix.employee_reimbursements}${employeeId}`
              );
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load reimbursements. Please try again.",
              });
              return null;
            }

            const hasNextPage = Boolean(
              meta?.count && meta.count / (0 + 1) > LAZY_LOADING_LIMIT
            );
            return (
              <>
                <div className='w-full flex items-center justify-between pb-4'>
                  <div className='w-full flex justify-between items-center'>
                    <div className='flex'>
                      <ReimbursementSearchFilter
                        disabled={!data?.length && noFilters}
                        userEmails={
                          usersData?.data
                            ? usersData?.data?.map((user) => user!.email)
                            : []
                        }
                        employeeId={employeeId}
                      />
                      <FilterList filters={filters} />
                    </div>

                    <Link
                      to={"add-reimbursement"}
                      className={cn(
                        buttonVariants({ variant: "primary-outline" }),
                        "flex items-center gap-1",
                        !hasPermission(
                          role,
                          `${createRole}:${attribute.employeeReimbursements}`
                        ) && "hidden"
                      )}
                    >
                      <span>Add</span>
                      <span className='hidden md:flex justify-end'>Claim</span>
                    </Link>
                  </div>
                </div>

                <ReimbursementsTable
                  data={data ?? []}
                  noFilters={noFilters}
                  columns={columns({ isEmployeeRoute: true })}
                  hasNextPage={hasNextPage}
                  pageSize={LAZY_LOADING_LIMIT}
                  env={env}
                  employeeId={employeeId}
                />
              </>
            );
          }}
        </Await>
      </Suspense>
      <Outlet />
    </section>
  );
}

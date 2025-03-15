import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@canny_ecosystem/ui/command";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, type ClientLoaderFunctionArgs, defer, Outlet, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PayrollCard } from "@/components/payroll/payroll-card";
import { getPendingOrSubmittedPayrollsByCompanyId } from "@canny_ecosystem/supabase/queries";
import { ErrorBoundary } from "@/components/error-boundary";
import { clientCaching } from "@/utils/cache";
import { cacheKeyPrefix, PayrollTypes } from "@/constant";
import { formatDate, transformStringArrayIntoOptions } from "@canny_ecosystem/utils";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const payrollsPromise = getPendingOrSubmittedPayrollsByCompanyId({
      supabase,
      companyId: companyId ?? "",
    });

    return defer({ payrollsPromise });
  } catch (error) {
    console.error("Run Payroll Error", error);
    return defer({ payrollsPromise: Promise.resolve({ data: [], error: null }) });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.run_payroll, args);
}

clientLoader.hydrate = true;

export default function ProjectsIndex() {
  const { payrollsPromise } = useLoaderData<typeof loader>();
  const [searchString, setSearchString] = useState("");

  return (
    <section className="py-4 px-4">
      <div className="w-full flex items-end justify-between">
        <Suspense fallback={<LoadingSpinner className="my-20" />}>
          <Await resolve={payrollsPromise}>
            {({ data, error }) => {
              if (error) return <ErrorBoundary error={error} message="Error in fetching payroll" />

              const { isDocument } = useIsDocument();

              // dropdown search
              const [tableData, setTableData] = useState(data);
              useEffect(() => {
                const filteredData = data?.filter((item) =>
                  Object.entries(item).some(
                    ([key, value]) =>
                      key !== "avatar" &&
                      String(value).toLowerCase().includes(searchString.toLowerCase())
                  )
                );
                setTableData(filteredData as any);
              }, [searchString, data]);
              return (
                <Command className="overflow-visible">
                  <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
                    {/* <CommandInput
                      divClassName="border border-input rounded-md h-10 flex-1"
                      placeholder="Search Payroll"
                      autoFocus={true}
                    /> */}
                    <div className="relative w-[30rem] ">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Icon name="magnifying-glass" size="sm" className="text-gray-400" />
                      </div>
                      <Input
                        placeholder="Search Employees"
                        onChange={(e) => setSearchString(e.target.value)}
                        className="pl-8 h-10 w-full focus-visible:ring-0"
                      />
                    </div>
                    <Combobox
                      className={cn("w-52 h-10")}
                      options={transformStringArrayIntoOptions(PayrollTypes)}
                      value={searchString}
                      onChange={(value: string) => { setSearchString(value) }}
                      placeholder={"Select Payroll Type"}
                    />
                  </div>
                  <CommandEmpty
                    className={cn(
                      "w-full py-40 capitalize text-lg tracking-wide text-center",
                      !isDocument && "hidden",
                    )}
                  >
                    No payrolls found
                  </CommandEmpty>
                  <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
                    <CommandGroup className="p-0 overflow-visible">
                      <div className="w-full grid gap-8 grid-cols-1">
                        {tableData?.map((payroll) => (
                          <CommandItem
                            key={payroll.id}
                            value={
                              payroll.id +
                              payroll?.commission +
                              payroll?.payroll_type +
                              formatDate(payroll?.run_date) +
                              payroll?.status +
                              payroll?.total_employees +
                              payroll?.total_net_amount +
                              formatDate(payroll?.created_at)
                            }
                            className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
                          >
                            <PayrollCard data={payroll} key={payroll.id} />
                          </CommandItem>
                        ))}
                      </div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              );
            }}
          </Await>
        </Suspense>
      </div>
      <Outlet />
    </section>
  );
}

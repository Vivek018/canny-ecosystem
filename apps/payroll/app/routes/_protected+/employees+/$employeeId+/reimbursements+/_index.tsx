import { reimbursementsColumns } from "@/components/reimbursements/table/columns";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import { LAZY_LOADING_LIMIT } from "@canny_ecosystem/supabase/constant";
import { getReimbursementsByEmployeeId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

export const UPDATE_REIMBURSEMENTS_TAG = "Update Reimbursements";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;
  const { supabase } = getSupabaseWithHeaders({ request });
  let reimbursementData = null;

  if (employeeId) {
    const { data, error } = await getReimbursementsByEmployeeId({
      supabase,
      employeeId: employeeId,
      from: 0,
      to: LAZY_LOADING_LIMIT - 1,
    });

    if (error) {
      throw error;
    }

    reimbursementData = data;
  }
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  return json({ data: reimbursementData, env, employeeId });
}

export default function ReimbursementsIndex() {
  const { data, env, employeeId } = useLoaderData<typeof loader>();

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(data);

  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    const filteredData = data?.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchString.toLowerCase())
      )
    );
    setTableData(filteredData!);
    setHasData(true);
  }, [searchString, data]);

  return (
    <section className="m-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
          <div className="relative w-96">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon
                name="magnifying-glass"
                size="sm"
                className="text-gray-400"
              />
            </div>
            <Input
              placeholder="Search Users"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="pl-8 h-10 w-full focus-visible:ring-0"
            />
          </div>
          <Link
            to={"add-reimbursement"}
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              "flex items-center gap-1"
            )}
          >
            <span>Add</span>
            <span className="hidden md:flex justify-end">Claim</span>
          </Link>
        </div>
      </div>
      <ReimbursementsTable
        data={tableData as any}
        columns={reimbursementsColumns({ isEmployeeRoute: true })}
        hasNextPage={hasData}
        pageSize={LAZY_LOADING_LIMIT}
        env={env}
        employeeId={employeeId}
      />
    </section>
  );
}

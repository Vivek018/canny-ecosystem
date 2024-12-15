import { ReimbursementsColumns } from "@/components/reimbursements/table/columns";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getEmployeesByOnlyCompanyId,
  getReimbursementsByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data: reimbursementData, error: reimbursementError } =
    await getReimbursementsByCompanyId({
      supabase,
      companyId,
    });
  if (reimbursementError || !reimbursementData) {
    throw reimbursementError;
  }

  const { data: employeeData, error: employeeError } =
    await getEmployeesByOnlyCompanyId({
      supabase,
      companyId,
    });
  if (employeeError || !employeeData) {
    throw employeeError;
  }

  const reimbursementMap = new Map();
  // biome-ignore lint/complexity/noForEach: <explanation>
  reimbursementData.forEach((reimbursement) => {
    reimbursementMap.set(reimbursement.employee_id, reimbursement);
  });

  const mergedData = employeeData.map((employee) => {
    const reimbursement = reimbursementMap.get(employee.id);

    return {
      ...employee,
      status: reimbursement?.status,
      claimed_amount: reimbursement?.claimed_amount,
      approved_amount: reimbursement?.approved_amount,
      is_deductible: reimbursement?.is_deductible,
      submitted_date: reimbursement?.submitted_date,
    };
  });

  return json({ claims: mergedData });
}

export default function Reimbursements() {
  const { claims } = useLoaderData<typeof loader>();

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(claims);

  useEffect(() => {
    const filteredData = claims?.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchString.toLowerCase())
      )
    );
    setTableData(filteredData);
  }, [searchString, claims]);

  return (
    <section className="m-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full  flex justify-between items-center">
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
        </div>
      </div>
      <ReimbursementsTable
        data={tableData as any}
        columns={ReimbursementsColumns}
      />
    </section>
  );
}

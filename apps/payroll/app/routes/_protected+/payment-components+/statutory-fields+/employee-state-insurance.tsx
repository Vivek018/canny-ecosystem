import ESINoData from "@/components/statutory-fields/employee-state-insurance/esi-nodata";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getEmployeeStateInsuranceByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import React from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data, error } = await getEmployeeStateInsuranceByCompanyId({
    supabase,
    companyId,
  });

  if (error) throw error;
  return json({ data: data as any });
};

const EmployeeStateInsurance = () => {
  const { data } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleDeleteESI = async () => {
    submit(
      {},
      {
        method: "post",
        action: `/payment-components/statutory-fields/${data?.[0]?.id}/delete-esi`,
        replace: true,
      }
    );
  };

  if (!data?.length) return <ESINoData />;
  return (
    <div className=" w-full">
      <div className="min-h-screen w-2/5">
        <div className="flex items-center gap-5 mb-8">
          <h4 className="text-lg font-semibold">Employees' State Insurance</h4>
          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/${data?.[0]?.id}/update-esi`}
            className="p-2 rounded-full bg-secondary grid place-items-center"
          >
            <Icon name="edit" size="sm" />
          </Link>
          </div>
        <div className="flex flex-col mb-2 justify-between gap-6 w-full text-[0.95rem]">
        <div className="flex gap-1 max-md:flex-col">
            <div className="w-1/2 text-gray-500">ESI Number</div>
            <div className="w-1/2 self-start font-[500]">
              {data?.[0]?.esi_number || "-"}
            </div>
          </div>
          <div className="flex gap-1 max-md:flex-col">
            <div className="w-1/2 text-gray-500">Deduction Cycle</div>
            <div className="w-1/2 self-start font-[500] capitalize">
              {replaceUnderscore(data?.[0]?.deduction_cycle)}
            </div>
          </div>
          <div className="flex gap-1 max-md:flex-col">
            <div className="w-1/2 text-gray-500">
              Employees' Contribution
            </div>
            <div className="w-1/2 self-start font-[500]">
              {data?.[0]?.employees_contribution * 100}% of Gross Pay
            </div>
          </div>
          <div className="flex gap-1 max-md:flex-col">
            <div className="w-1/2 text-gray-500">
              Employer's Contribution
            </div>
            <div className="w-1/2 self-start font-[500]">
              {data?.[0]?.employers_contribution * 100}% of Gross Pay
            </div>
          </div>
        </div>
        <hr className="my-6" />
        <button
          className="flex mt-2 gap-1 text-sm items-center text-blue-500 cursor-pointer"
          onClick={handleDeleteESI}
        >
          <Icon name="trash" />
          <span>Disable ESI</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeStateInsurance;

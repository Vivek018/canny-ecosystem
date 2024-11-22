import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getEmployeeStateInsuranceByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import React from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data, error } = await getEmployeeStateInsuranceByCompanyId({
    supabase,
    companyId,
  });

  console.log("daaaaaaaaaaaaaaaaaaa-", data, error);
  if (error) throw error;
  return json({ data: data as any });
};

const EmployeeStateInsurance = () => {
  const { data } = useLoaderData<typeof loader>();
  console.log(data?.[0]);
  return (
    <div className="py-5 pl-5">
      <div className="min-h-screen max-w-[50vw] py-6">
        <div className="flex items-center gap-5">
          <h4 className="text-lg font-semibold">Employees' Provident Fund</h4>
          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/create-employee-state-insurance`}
            className="p-2 rounded-full bg-secondary grid place-items-center"
          >
            <Icon name="edit" size="sm" />
          </Link>
        </div>
        <br />
        <br />
        <div className="flex flex-col justify-between gap-6">
          <div className="flex gap-10">
            <div className="min-w-[50%] text-gray-500">ESI Number</div>
            <div className="self-start font-[500] text-[0.95rem]">
              {data?.[0]?.esi_number || "-"}
            </div>
          </div>
          <div className="flex gap-10">
            <div className="min-w-[50%] text-gray-500">Deduction Cycle</div>
            <div className="self-start font-[500] text-[0.95rem] capitalize">{data?.[0]?.deduction_cycle}</div>
          </div>
          <div className="flex gap-10">
            <div className="min-w-[40%] text-gray-500">
              Employees' Contribution
            </div>
            <div className="self-start font-[500] text-[0.95rem]">
              {data?.[0]?.employees_contribution * 100}% of Gross Pay
            </div>
          </div>
          <div className="flex gap-10">
            <div className="min-w-[40%] text-gray-500">
              Employer's Contribution
            </div>
            <div className="self-start font-[500] text-[0.95rem]">
              {data?.[0]?.employers_contribution * 100}% of Gross Pay
            </div>
          </div>
        </div>
        <br />
        <hr />
        <br />
        <button className="flex gap-1 text-sm items-center text-blue-500 cursor-pointer">
          <svg
            width="18"
            height="18"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span>Disable ESI</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeStateInsurance;

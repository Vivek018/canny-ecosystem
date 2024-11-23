import StatutoryBonusNoData from "@/components/statutory-fields/statutory-bonus/statutory-bonus-nodata";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getEmployeeStateInsuranceByCompanyId,
  getStatutoryBonusByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useLoaderData, useSubmit } from "@remix-run/react";
import React from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data, error } = await getStatutoryBonusByCompanyId({
    supabase,
    companyId,
  });

  console.log("daaaaaaaaaaaaaaaaaaa-", data, error);
  if (error) throw error;
  return json({ data: data as any });
};

export default function StatutoryBonus() {
  const { data } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  console.log(!data);

  const handleDelete = () => {
    submit({}, {
      method: "post",
      action: `/payment-components/statutory-fields/${data?.[0]?.id}/delete-statutory-bonus`,
      replace: true,
    })
  };

  if (!data.length) return <StatutoryBonusNoData />;
  return (
    <div className="py-5 pl-5 w-full">
      <div className="min-h-screen w-1/3 py-6">
        <div className="flex items-center gap-5">
          <h4 className="text-lg font-semibold">Statutory Bonus</h4>
          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/${data?.[0]?.id}/update-statutory-bonus`}
            className="p-2 rounded-full bg-secondary grid place-items-center"
          >
            <Icon name="edit" size="sm" />
          </Link>
        </div>
        <br />
        <br />
        <div className="flex justify-between">
          <div className="flex flex-col gap-5">
            <div className="min-w-[50%] text-gray-500">Bonus Payment Cycle</div>
            <div className="self-start font-[500] text-[0.95rem] capitalize">
              {data?.[0]?.payout_month || "Monthly"}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="min-w-[50%] text-gray-500">Percentage of Bonus</div>
            <div className="self-start font-[500] text-[0.95rem] capitalize">
              {data?.[0]?.percentage}%
            </div>
          </div>
        </div>
        <br />
        <hr />
        <br />
        <button
          className="flex gap-1 text-sm items-center text-blue-500 cursor-pointer"
          onClick={handleDelete}
        >
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
          <span>Disable Statutory Bonus</span>
        </button>
      </div>
    </div>
  );
}

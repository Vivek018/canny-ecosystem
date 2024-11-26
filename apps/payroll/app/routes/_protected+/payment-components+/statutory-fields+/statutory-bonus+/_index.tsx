import StatutoryBonusNoData from "@/components/statutory-fields/statutory-bonus/statutory-bonus-nodata";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getStatutoryBonusByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useLoaderData, useSubmit } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data, error } = await getStatutoryBonusByCompanyId({
    supabase,
    companyId,
  });

  if (error) throw error;
  return json({ data: data as any });
};

export default function StatutoryBonusIndex() {
  const { data } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleDelete = () => {
    submit(
      {},
      {
        method: "post",
        action: `/payment-components/statutory-fields/statutory-bonus/${data?.[0]?.id}/delete-statutory-bonus`,
        replace: true,
      }
    );
  };

  if (!data.length) return <StatutoryBonusNoData />;
  return (
    <div className="w-full">
      <div className="min-h-screen w-2/5">
        <div className="flex items-center gap-5 mb-8">
          <h4 className="text-lg font-semibold">Statutory Bonus</h4>
          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/statutory-bonus/${data?.[0]?.id}/update-statutory-bonus`}
            className="p-2 rounded-full bg-secondary grid place-items-center"
          >
            <Icon name="edit" size="sm" />
          </Link>
        </div>
        <div className="flex justify-between min-w-4/5 text-[0.95rem] gap-8 max-lg:flex-col">
          <div className="flex flex-col gap-5 ">
            <div className=" text-gray-500">Bonus Payment Cycle</div>
            <div className="self-start font-[500] capitalize">
              {data?.[0]?.payment_frequency || "Monthly"}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="text-gray-500">Percentage of Bonus</div>
            <div className="self-start font-[500] capitalize">
              {data?.[0]?.percentage}%
            </div>
          </div>
        </div>
        <hr className="my-6" />
        <button
          type="button"
          className="flex gap-1 text-sm items-center text-blue-500 cursor-pointer"
          onClick={handleDelete}
        >
          <Icon name="trash" />
          <span>Disable Statutory Bonus</span>
        </button>
      </div>
    </div>
  );
}

import { DeleteStatutoryBonus } from "@/components/statutory-fields/statutory-bonus/delete-statutory-bonus";
import { StatutoryBonusNoData } from "@/components/statutory-fields/statutory-bonus/statutory-bonus-no-data";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getStatutoryBonusByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data } = await getStatutoryBonusByCompanyId({
    supabase,
    companyId,
  });

  return json({ data });
};

export default function StatutoryBonusIndex() {
  const { data } = useLoaderData<typeof loader>();

  if (!data) return <StatutoryBonusNoData />;
  return (
    <div className="p-4 w-full">
      <div className="min-h-screen w-2/5">
        <div className="flex items-center gap-5 mb-8">
          <h4 className="text-lg font-semibold">Statutory Bonus</h4>
          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/statutory-bonus/${data?.id}/update-statutory-bonus`}
            className="p-2 rounded-full bg-secondary grid place-items-center"
          >
            <Icon name="edit" size="sm" />
          </Link>
        </div>
        <div className="flex justify-between min-w-4/5 gap-8 max-lg:flex-col">
          <div className="flex flex-col gap-5 ">
            <div className=" text-gray-500">Bonus Payment Cycle</div>
            <div className="self-start capitalize">
              {data?.payment_frequency || "Monthly"}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="text-gray-500">Percentage of Bonus</div>
            <div className="self-start capitalize">
              {data?.percentage}%
            </div>
          </div>
        </div>
        <hr className="my-6" />
        <div>
          <DeleteStatutoryBonus employeeStatutoryBonusId={data?.id} />
        </div>
      </div>
    </div>
  );
}

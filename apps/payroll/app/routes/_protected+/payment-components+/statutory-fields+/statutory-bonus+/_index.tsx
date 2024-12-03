import { DeleteStatutoryBonus } from "@/components/statutory-fields/statutory-bonus/delete-statutory-bonus";
import { StatutoryBonusNoData } from "@/components/statutory-fields/statutory-bonus/statutory-bonus-no-data";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getStatutoryBonusByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { payoutMonths } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs): Promise<Response> => {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const { data, error } = await getStatutoryBonusByCompanyId({
      supabase,
      companyId,
    });

    if (error) {
      return json({
        status: "error",
        message: "Failed to load data",
        data,
        error,
      });
    }

    return json({
      status: "success",
      message: "Statutory Bonus loaded successfully",
      data,
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        data: null,
        error,
      },
      { status: 500 },
    );
  }
};

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className }) => {
  return (
    <div className={`flex gap-1 max-md:flex-col ${className ?? ""}`}>
      <div className="w-60 text-muted-foreground">{label}</div>
      <div className="w-96 self-start">{value || "-"}</div>
    </div>
  );
};

export default function StatutoryBonusIndex() {
  const { data, status, message, error } = useLoaderData<typeof loader>();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "error" && error?.code !== "PGRST116") {
      toast({
        title: "Error",
        description: error?.message ?? message ?? "Failed to load",
        variant: "destructive",
      });
    }
  }, []);

  if (!data) return <StatutoryBonusNoData />;
  return (
    <div className="p-4 w-full">
      <div>
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
        <div className="flex flex-col justify-between min-w-4/5 gap-8 max-lg:flex-col">
          <DetailItem
            label="Bonus Payment Cycle"
            value={data?.payment_frequency}
            className="capitalize"
          />
          <DetailItem
            label="Percentage of Bonus"
            value={`${data?.percentage} %`}
          />
          {data?.payout_month && data?.payment_frequency !== "monthly" && (
            <DetailItem
              label="Payout Month"
              value={payoutMonths[data?.payout_month - 1].label}
            />
          )}
        </div>
        <hr className="my-6" />
        <div>
          <DeleteStatutoryBonus employeeStatutoryBonusId={data?.id} />
        </div>
      </div>
    </div>
  );
}

import type { StatutoryBonusDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Icon } from "@canny_ecosystem/ui/icon";
import { attribute, payoutMonths } from "@canny_ecosystem/utils/constant";
import { Link } from "@remix-run/react";
import { DeleteStatutoryBonus } from "@/components/statutory-fields/statutory-bonus/delete-statutory-bonus";
import { StatutoryBonusNoData } from "./statutory-bonus-no-data";
import { ErrorBoundary } from "@/components/error-boundary";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";

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

export function StatutoryBonusWrapper({
  data,
  error,
}: {
  data: Omit<StatutoryBonusDatabaseRow, "created_at" | "is_default"> | null;
  error: Error | null | { message: string };
}) {
  const { role } = useUser();
  if (error)
    return <ErrorBoundary error={error} message="Failed to load data" />;
  if (!data) return <StatutoryBonusNoData />;

  return (
    <section className="p-4 w-full">
      <div>
        <div className="flex items-center gap-5 mb-8">
          <h4 className="text-lg font-semibold">Statutory Bonus</h4>
          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/statutory-bonus/${data?.id}/update-statutory-bonus`}
            className={cn(
              "p-2 rounded-full bg-secondary grid place-items-center",
              !hasPermission(
                `${role}`,
                `${updateRole}:${attribute.statutoryFieldsStatutoryBonus}`,
              ) && "hidden",
            )}
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
    </section>
  );
}

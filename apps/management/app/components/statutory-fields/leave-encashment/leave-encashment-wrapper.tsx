import { Icon } from "@canny_ecosystem/ui/icon";
import { Link } from "@remix-run/react";
import type { LeaveEncashmentDatabaseRow } from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";
import { LeaveEncashmentNoData } from "./leave-encashment-no-data";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { DeleteLeaveEncashment } from "./delete-leave-encashment";

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className }) => {
  return (
    <div className={`flex gap-2 max-lg:flex-col ${className ?? ""}`}>
      <div className="w-64 text-muted-foreground">{label}</div>
      <div className="self-start font-medium">{value || "-"}</div>
    </div>
  );
};
export function LeaveEncashmentWrapper({
  data,
  error,
}: {
  data: Omit<LeaveEncashmentDatabaseRow, "created_at"> | null;
  error: Error | null | { message: string };
}) {
  const { role } = useUser();
  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.leave_encashment);
    return <ErrorBoundary error={error} message="Failed to load data" />;
  }

  if (!data) return <LeaveEncashmentNoData />;

  return (
    <>
      <div>
        <div className="flex items-center gap-4 mb-8">
          <h4 className="text-lg font-semibold">Leave Encashment</h4>

          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/leave-encashment/${data?.id}/update-leave-encashment`}
            className={cn(
              "p-2 rounded-full bg-secondary grid place-items-center",
              !hasPermission(
                `${role}`,
                `${updateRole}:${attribute.statutoryFieldsLeaveEncashment}`,
              ) && "hidden",
            )}
          >
            <Icon name="edit" size="sm" />
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-6 text-base">
          <DetailItem label="Eligible Years" value={data?.eligible_years} />
          <DetailItem
            label="Leave Encashment Frequency"
            value={data?.encashment_frequency}
            className="capitalize"
          />
          <DetailItem
            label="Encashment Multiplier"
            value={data?.encashment_multiplier}
          />
          <DetailItem
            label="Maximum Encashable Leaves"
            value={data?.max_encashable_leaves}
          />
          <DetailItem
            label="Maximum Encashment Amount"
            value={data?.max_encashment_amount}
          />
          <DetailItem
            label="Working Days Per Year"
            value={data?.working_days_per_year}
          />
          <hr />
          <div>
            <DeleteLeaveEncashment leaveEncashmentId={data?.id} />
          </div>
        </div>
      </div>
    </>
  );
}

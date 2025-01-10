import { Icon } from "@canny_ecosystem/ui/icon";
import { Link } from "@remix-run/react";
import type { GratuityDatabaseRow } from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";
import { GratuityNoData } from "./gratuity-no-data";
import { DeleteGratuity } from "./delete-gratuity";

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className }) => {
  return (
    <div className={`flex gap-2 max-lg:flex-col ${className ?? ""}`}>
      <div className="w-52 text-muted-foreground">{label}</div>
      <div className="self-start font-medium">{value || "-"}</div>
    </div>
  );
};
export function GratuityWrapper({
  data,
  error,
}: {
  data: Omit<GratuityDatabaseRow, "created_at" | "updated_at"> | null;
  error: Error | null | { message: string };
}) {
  if (error)
    return <ErrorBoundary error={error} message="Failed to load data" />;
  if (!data) return <GratuityNoData />;

  return (
    <>
      <div>
        <div className="flex items-center gap-4 mb-8">
          <h4 className="text-lg font-semibold">Gratuity</h4>

          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/gratuity/${data?.id}/update-gratuity`}
            className="p-2 rounded-full bg-secondary grid place-items-center"
          >
            <Icon name="edit" size="sm" />
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-6 text-base">
          <DetailItem
            label="Eligibility Years"
            value={data?.eligibility_years}
          />
          <DetailItem
            label="Present day per year"
            value={data?.present_day_per_year}
            className="capitalize"
          />
          <DetailItem
            label="Payment days per year"
            value={data?.payment_days_per_year}
          />
          <DetailItem
            label="Maximum  Multiply Limit"
            value={data?.max_multiply_limit}
          />
          <DetailItem
            label="Maximum Amount Limit"
            value={data?.max_amount_limit}
          />
          <hr />
          <div>
            <DeleteGratuity gratuityId={data?.id} />
          </div>
        </div>
      </div>
    </>
  );
}
